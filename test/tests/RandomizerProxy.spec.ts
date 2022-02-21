import { Utils, zeroAddress } from "../helpers/Utils";
import { MichelsonMap } from "@taquito/michelson-encoder";

import { rejects } from "assert";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../scripts/sandbox/accounts";

import { ubineticProxyStorage } from "../../storage/UbineticProxy";
import { ubineticStorage } from "../../storage/test/Ubinetic";
import { fa2Storage } from "../../storage/test/FA2";
import { horseStorage } from "../../storage/Horse";

import { UbineticProxy } from "test/helpers/UbineticProxy";
import { Ubinetic } from "test/helpers/Ubinetic";

import {
  Common,
  UbineticProxy as UbineticProxyErrors,
  RandomizerProxy as RandomizerProxyErrors,
} from "test/helpers/Errors";

import { randomizerStorage } from "../../storage/test/Randomizer";
import { randomizerProxyStorage } from "../../storage/RandomizerProxy";

import { Randomizer } from "test/helpers/Randomizer";
import { SBAccount } from "test/types/Common";
import { RandomizerProxy } from "test/helpers/RandomizerProxy";
import { Horse } from "test/helpers/Horse";
import { FA2 } from "test/helpers/FA2";

chai.use(require("chai-bignumber")(BigNumber));

describe("RandomizerProxy", async () => {
  var randomizer: Randomizer;
  var ubinetic: Ubinetic;
  var ubineticProxy: UbineticProxy;
  var utils: Utils;
  var randomizerProxy: RandomizerProxy;
  var uusd: FA2;
  var horse: Horse;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;
  var carol: SBAccount = accounts.carol;

  var entropy: any = 0;

  const tokenMetadata = MichelsonMap.fromLiteral({
    symbol: Buffer.from("QST").toString("hex"),
    name: Buffer.from("QSTT").toString("hex"),
    decimals: Buffer.from("6").toString("hex"),
    icon: Buffer.from("").toString("hex"),
  });

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    ubineticStorage.valid_script = Buffer.from(
      "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
    ).toString("hex");
    ubineticStorage.valid_sources = [alice.pkh, bob.pkh];

    ubinetic = await Ubinetic.originate(utils.tezos, ubineticStorage);

    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "986d1ec15619b3321e9b0b3389221f059b28361969d8f82185eafc5675fc45f69721a9439fa47e1a9b4cb40490e07b44"
    );

    ubineticProxyStorage.ubinetic = ubinetic.contract.address;
    ubineticProxyStorage.admin = alice.pkh;

    ubineticProxy = await UbineticProxy.originate(
      utils.tezos,
      ubineticProxyStorage
    );

    randomizer = await Randomizer.originate(utils.tezos, randomizerStorage);

    randomizerProxyStorage.randomizer = randomizer.contract.address;
    randomizerProxyStorage.admin = alice.pkh;
    randomizerProxyStorage.pending_admin = alice.pkh;

    randomizerProxy = await RandomizerProxy.originate(
      utils.tezos,
      randomizerProxyStorage
    );

    uusd = await FA2.originate(utils.tezos, fa2Storage);

    horseStorage.randomizer_proxy = randomizerProxy.contract.address;
    horseStorage.uusd_token = uusd.contract.address;
    horseStorage.ubinetic_proxy = ubineticProxy.contract.address;

    horse = await Horse.originate(utils.tezos, horseStorage);
  });

  it("should fail if not admin is trying to setup new pending admin", async () => {
    await utils.setProvider(bob.sk);
    await rejects(randomizerProxy.setAdmin(bob.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should setup new pending admin by admin", async () => {
    await utils.setProvider(alice.sk);
    await randomizerProxy.setAdmin(bob.pkh);
    await randomizerProxy.updateStorage();

    expect(randomizerProxy.storage.admin).to.equal(alice.pkh);
    expect(randomizerProxy.storage.pending_admin).to.equal(bob.pkh);
  });

  it("should fail if not pending admin is trying to confirm new admin", async () => {
    await rejects(randomizerProxy.confirmAdmin(), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_PENDING_ADMIN);

      return true;
    });
  });

  it("should confirm new admin by pending admin", async () => {
    await utils.setProvider(bob.sk);
    await randomizerProxy.confirmAdmin();
    await randomizerProxy.updateStorage();

    expect(randomizerProxy.storage.admin).to.equal(bob.pkh);
    expect(randomizerProxy.storage.pending_admin).to.equal(zeroAddress);
  });

  it("should fail if not admin is trying to change ubinetic contract address", async () => {
    await utils.setProvider(alice.sk);
    await rejects(randomizerProxy.changeRandomizer(alice.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should change ubinetic contract address by admin", async () => {
    const randomizer: string = bob.pkh;

    await utils.setProvider(bob.sk);
    await randomizerProxy.changeRandomizer(randomizer);

    randomizerProxy = await RandomizerProxy.init(
      randomizerProxy.contract.address,
      utils.tezos
    );

    await randomizerProxy.updateStorage();

    expect(randomizerProxy.storage.randomizer).to.equal(randomizer);
  });

  it("should return proper entropy for epoch", async () => {
    await utils.setProvider(alice.sk);
    await ubineticProxy.changeUbinetic(ubinetic.contract.address);

    ubineticProxy = await UbineticProxy.init(
      ubineticProxy.contract.address,
      utils.tezos
    );

    const epoch: BigNumber = new BigNumber(0);
    entropy = await ubineticProxy.contract.contractViews
      .get_entropy(epoch)
      .executeView({ viewCaller: alice.pkh });

    await ubinetic.updateStorage({ entropies: [epoch] });

    expect(entropy).to.be.equal(ubinetic.storage.entropies[epoch.toFixed()]);
  });

  it("should return random", async () => {
    await utils.setProvider(bob.sk);
    await randomizerProxy.changeRandomizer(randomizer.contract.address);

    randomizerProxy = await RandomizerProxy.init(
      randomizerProxy.contract.address,
      utils.tezos
    );

    const random: any = await randomizerProxy.contract.contractViews
      .get_random({
        _from: 0,
        _to: 10,
        entropy: entropy,
        includeRandomizerEntropy: 0,
      })
      .executeView({ viewCaller: alice.pkh });

    console.log(random.toString());
  });

  it("should mint", async () => {
    await utils.setProvider(alice.sk);
    await horse.mint_token("HR1", tokenMetadata);
    await horse.updateStorage();
    console.log(horse.storage.free_token);
  });

  it("should bet", async () => {
    await utils.setProvider(alice.sk);

    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "986d1ec15619b3321e9b0b3389221f059b28361969d8f82185eafc5675fc45f69721a9439fa47e1a9b4cb40490e07b44"
    );
    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "2444172bc8f0aeb2340164d3af6cf6bffeda44364e31f6b9453371d3ec20bdc41cdc24a7c043bec38fdd4789e7194e53"
    );
    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "97e676dc8522a7f26160001afc0606b603cdd85bb3238f8d3db01aceae18e6ba9f595f1d69353ca5ce1922286bf1b69f"
    );
    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "74a3ecfeec36f33bd6e58a9e26c6b03bdb4b9a68fc954f3ed89f4a76cd954d48f2f6d098be55848cdf2cb271700f14f9"
    );
    await ubinetic.updateStorage();

    await uusd.updateOperators([
      {
        add_operator: {
          owner: alice.pkh,
          operator: horse.contract.address,
          token_id: new BigNumber(0),
        },
      },
    ]);
    await horse.bet(0, 0, 100);

    await horse.updateStorage({
      pools: [0],
      bets: [[alice.pkh, 0]]
    });

    await uusd.updateStorage({
      account_info: [[horse.contract.address]]
    });

    console.log(horse.storage.free_token);
    // let bet = horse.storage.bets[`${alice.pkh}, ${0}`];
    // let bal = uusd.storage.account_info[horse.contract.address];
    // console.log(bal.balances);
    console.log(await uusd.getBalance(alice.pkh, new BigNumber(0)));

    // console.log(bet);
    // console.log(bet[0]);
    const pool = horse.storage.pools[0];
    console.log(pool.toString());
  });
});
