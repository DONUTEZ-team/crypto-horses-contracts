import { Utils, uUSD_PRECISION } from "../../helpers/Utils";

import { rejects } from "assert";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../../scripts/sandbox/accounts";

import { ubineticProxyStorage } from "../../../storage/UbineticProxy";
import { ubineticStorage } from "../../../storage/test/Ubinetic";
import { fa2Storage } from "../../../storage/test/FA2";
import { gameStorage } from "../../../storage/Game";

import { Common, Game as GameErrors } from "test/helpers/Errors";
import { UbineticProxy } from "test/helpers/UbineticProxy";
import { Ubinetic } from "test/helpers/Ubinetic";
import { SBAccount } from "test/types/Common";
import { LaunchRace } from "test/types/Game";
import { Game } from "test/helpers/Game";
import { FA2 } from "test/helpers/FA2";

chai.use(require("chai-bignumber")(BigNumber));

describe("Game (main methods)", async () => {
  var ubineticProxy: UbineticProxy;
  var ubinetic: Ubinetic;
  var utils: Utils;
  var game: Game;
  var uusd: FA2;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;
  var carol: SBAccount = accounts.carol;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    uusd = await FA2.originate(utils.tezos, fa2Storage);

    ubineticStorage.valid_script = Buffer.from(
      "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
    ).toString("hex");
    ubineticStorage.valid_sources = [alice.pkh, bob.pkh, carol.pkh];

    ubinetic = await Ubinetic.originate(utils.tezos, ubineticStorage);

    ubineticProxyStorage.ubinetic = ubinetic.contract.address;
    ubineticProxyStorage.admin = alice.pkh;

    ubineticProxy = await UbineticProxy.originate(
      utils.tezos,
      ubineticProxyStorage
    );

    gameStorage.storage.uusd_token = uusd.contract.address;
    gameStorage.storage.ubinetic_proxy = ubineticProxy.contract.address;
    gameStorage.storage.admin = alice.pkh;
    gameStorage.storage.min_registration_period = new BigNumber(10);
    gameStorage.storage.min_betting_period = new BigNumber(10);

    game = await Game.originate(utils.tezos, gameStorage);

    await game.setLambdas();
  });

  it("should fail if not admin is trying to launch race", async () => {
    const params: LaunchRace = {
      name: "Race",
      location: "Ipodrom",
      registration_fee: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(6),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
    };

    await utils.setProvider(bob.sk);
    await rejects(game.launchRace(params), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should fail if registration start time is too low", async () => {
    const params: LaunchRace = {
      name: "Race",
      location: "Ipodrom",
      registration_fee: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(6),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
    };

    await utils.setProvider(alice.sk);
    await rejects(game.launchRace(params), (err: Error) => {
      expect(err.message).to.equal(GameErrors.ERR_TOO_LOW_REGISTRATION_START);

      return true;
    });
  });

  it("should fail if betting start time is too low", async () => {
    const params: LaunchRace = {
      name: "Race",
      location: "Ipodrom",
      registration_fee: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(6),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          10
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
    };

    await rejects(game.launchRace(params), (err: Error) => {
      expect(err.message).to.equal(GameErrors.ERR_TOO_LOW_BETTING_START);

      return true;
    });
  });

  it("should fail if race start time is too low", async () => {
    const params: LaunchRace = {
      name: "Race",
      location: "Ipodrom",
      registration_fee: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(6),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          10
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          20
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000
      ),
    };

    await rejects(game.launchRace(params), (err: Error) => {
      expect(err.message).to.equal(GameErrors.ERR_TOO_LOW_RACE_START);

      return true;
    });
  });

  it("should launch race - 1", async () => {
    const expectedRaceId: BigNumber = new BigNumber(0);
    const params: LaunchRace = {
      name: "Race",
      location: "Ipodrom",
      registration_fee: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(1).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(6),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          2
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          12
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          22
      ),
    };

    await game.launchRace(params);
    await game.updateStorage({
      races: [expectedRaceId.toFixed()],
    });

    console.log(game.storage.storage);
    console.log(game.storage.storage.races[expectedRaceId.toFixed()]);

    expect(game.storage.storage.races_count).to.be.bignumber.equal(
      expectedRaceId.plus(1)
    );
  });
});
