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
import { LaunchRace, Race } from "test/types/Game";
import { Ubinetic } from "test/helpers/Ubinetic";
import { SBAccount } from "test/types/Common";
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
      name: "Race 1",
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
      races: [expectedRaceId],
    });

    const race: Race = game.storage.storage.races[expectedRaceId.toFixed()];

    expect(game.storage.storage.races_count).to.be.bignumber.equal(
      expectedRaceId.plus(1)
    );
    expect(race.name).to.be.equal(params.name);
    expect(race.location).to.be.equal(params.location);
    expect(race.rid).to.be.bignumber.equal(expectedRaceId);
    expect(race.registration_fee).to.be.bignumber.equal(
      params.registration_fee
    );
    expect(race.min_bid).to.be.bignumber.equal(params.min_bid);
    expect(race.bid_step).to.be.bignumber.equal(params.bid_step);
    expect(race.max_participants_count).to.be.bignumber.equal(
      params.max_participants_count
    );
    expect(race.participants_count).to.be.bignumber.equal(new BigNumber(0));
    expect(String(Date.parse(race.registration_start) / 1000)).to.be.equal(
      params.registration_start
    );
    expect(String(Date.parse(race.betting_start) / 1000)).to.be.equal(
      params.betting_start
    );
    expect(String(Date.parse(race.race_start) / 1000)).to.be.equal(
      params.race_start
    );
  });

  it("should launch race - 2", async () => {
    const expectedRaceId: BigNumber = new BigNumber(1);
    const params: LaunchRace = {
      name: "Race 2",
      location: "New York",
      registration_fee: new BigNumber(10).multipliedBy(uUSD_PRECISION),
      min_bid: new BigNumber(5).multipliedBy(uUSD_PRECISION),
      bid_step: new BigNumber(2).multipliedBy(uUSD_PRECISION),
      max_participants_count: new BigNumber(10),
      registration_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          60
      ),
      betting_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          120
      ),
      race_start: String(
        Date.parse((await utils.tezos.rpc.getBlockHeader()).timestamp) / 1000 +
          180
      ),
    };

    await game.launchRace(params);
    await game.updateStorage({
      races: [expectedRaceId],
    });

    const race: Race = game.storage.storage.races[expectedRaceId.toFixed()];

    expect(game.storage.storage.races_count).to.be.bignumber.equal(
      expectedRaceId.plus(1)
    );
    expect(race.name).to.be.equal(params.name);
    expect(race.location).to.be.equal(params.location);
    expect(race.rid).to.be.bignumber.equal(expectedRaceId);
    expect(race.registration_fee).to.be.bignumber.equal(
      params.registration_fee
    );
    expect(race.min_bid).to.be.bignumber.equal(params.min_bid);
    expect(race.bid_step).to.be.bignumber.equal(params.bid_step);
    expect(race.max_participants_count).to.be.bignumber.equal(
      params.max_participants_count
    );
    expect(race.participants_count).to.be.bignumber.equal(new BigNumber(0));
    expect(String(Date.parse(race.registration_start) / 1000)).to.be.equal(
      params.registration_start
    );
    expect(String(Date.parse(race.betting_start) / 1000)).to.be.equal(
      params.betting_start
    );
    expect(String(Date.parse(race.race_start) / 1000)).to.be.equal(
      params.race_start
    );
  });
});
