import { Utils, zeroAddress } from "../../helpers/Utils";

import { rejects } from "assert";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../../scripts/sandbox/accounts";

import { gameStorage } from "../../../storage/Game";

import { SBAccount } from "test/types/Common";
import { Common } from "test/helpers/Errors";
import { Game } from "test/helpers/Game";

chai.use(require("chai-bignumber")(BigNumber));

describe("Game (admin methods)", async () => {
  var utils: Utils;
  var game: Game;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    gameStorage.storage.admin = alice.pkh;

    game = await Game.originate(utils.tezos, gameStorage);

    await game.setLambdas();
  });

  it("should fail if not admin is trying to setup new pending admin", async () => {
    await utils.setProvider(bob.sk);
    await rejects(game.setAdmin(bob.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should setup new pending admin by admin", async () => {
    await utils.setProvider(alice.sk);
    await game.setAdmin(bob.pkh);
    await game.updateStorage();

    expect(game.storage.storage.admin).to.equal(alice.pkh);
    expect(game.storage.storage.pending_admin).to.equal(bob.pkh);
  });

  it("should fail if not pending admin is trying to confirm new admin", async () => {
    await rejects(game.confirmAdmin(), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_PENDING_ADMIN);

      return true;
    });
  });

  it("should confirm new admin by pending admin", async () => {
    await utils.setProvider(bob.sk);
    await game.confirmAdmin();
    await game.updateStorage();

    expect(game.storage.storage.admin).to.equal(bob.pkh);
    expect(game.storage.storage.pending_admin).to.equal(zeroAddress);
  });

  it("should fail if not admin is trying to set min registration time", async () => {
    await utils.setProvider(alice.sk);
    await rejects(game.setMinRegisterTime(new BigNumber(0)), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should set new min registration time by admin", async () => {
    const minRegisterTime: BigNumber = new BigNumber(20);

    await utils.setProvider(bob.sk);
    await game.setMinRegisterTime(minRegisterTime);
    await game.updateStorage();

    expect(game.storage.storage.min_registration_period).to.be.bignumber.equal(
      minRegisterTime
    );
  });

  it("should fail if not admin is trying to set min betting time", async () => {
    await utils.setProvider(alice.sk);
    await rejects(game.setMinBettingTime(new BigNumber(0)), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should set new min betting time by admin", async () => {
    const minBettingTime: BigNumber = new BigNumber(20);

    await utils.setProvider(bob.sk);
    await game.setMinBettingTime(minBettingTime);
    await game.updateStorage();

    expect(game.storage.storage.min_betting_period).to.be.bignumber.equal(
      minBettingTime
    );
  });
});
