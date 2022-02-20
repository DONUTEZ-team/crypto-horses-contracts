import { Utils, zeroAddress } from "../helpers/Utils";

import { rejects } from "assert";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../scripts/sandbox/accounts";

import { ubineticProxyStorage } from "../../storage/UbineticProxy";
import { ubineticStorage } from "../../storage/test/Ubinetic";

import { UbineticProxy } from "test/helpers/UbineticProxy";
import { Ubinetic } from "test/helpers/Ubinetic";

import { Common } from "test/helpers/Errors";

import { randomizerProxyStorage } from "../../storage/RandomizerProxy";
import { randomizerStorage } from "../../storage/test/Randomizer";

import { RandomizerProxy } from "test/helpers/RandomizerProxy";
import { Randomizer } from "test/helpers/Randomizer";
import { SBAccount } from "test/types/Common";

chai.use(require("chai-bignumber")(BigNumber));

describe("RandomizerProxy", async () => {
  var randomizerProxy: RandomizerProxy;
  var ubineticProxy: UbineticProxy;
  var randomizer: Randomizer;
  var ubinetic: Ubinetic;
  var utils: Utils;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;
  var carol: SBAccount = accounts.carol;

  var entropy: any = 0;

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

  it("should fail if not admin is trying to change randomizer contract address", async () => {
    await utils.setProvider(alice.sk);
    await rejects(randomizerProxy.changeRandomizer(alice.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should change randomizer contract address by admin", async () => {
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

  it("should return random ", async () => {
    await utils.setProvider(bob.sk);
    await randomizerProxy.changeRandomizer(randomizer.contract.address);

    randomizerProxy = await RandomizerProxy.init(
      randomizerProxy.contract.address,
      utils.tezos
    );

    const random: any = await randomizerProxy.contract.contractViews
      .get_random({
        _from: 1,
        _to: 10,
        entropy: entropy,
        includeRandomizerEntropy: 0,
      })
      .executeView({ viewCaller: alice.pkh });

    console.log(random.toFixed());
  });
});
