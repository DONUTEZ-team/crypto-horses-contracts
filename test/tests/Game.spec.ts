import { Utils } from "../helpers/Utils";

import chai from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../scripts/sandbox/accounts";

import { randomizerStorage } from "../../storage/test/Randomizer";
import { ubineticStorage } from "../../storage/test/Ubinetic";
import { fa2Storage } from "../../storage/test/FA2";
import { gameStorage } from "../../storage/Game";

import { Randomizer } from "test/helpers/Randomizer";
import { Ubinetic } from "test/helpers/Ubinetic";
import { SBAccount } from "test/types/Common";
import { Game } from "test/helpers/Game";
import { FA2 } from "test/helpers/FA2";

chai.use(require("chai-bignumber")(BigNumber));

describe("Game", async () => {
  var randomizer: Randomizer;
  var ubinetic: Ubinetic;
  var uusd: FA2;
  var utils: Utils;
  var game: Game;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;
  var carol: SBAccount = accounts.carol;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    uusd = await FA2.originate(utils.tezos, fa2Storage);

    randomizerStorage.admins = [alice.pkh];
    randomizerStorage.entropy =
      "6a6f533f5fe66002b9dff4d24bfc2f6cda418e536f6bd2c561ddf435648db656";

    randomizer = await Randomizer.originate(utils.tezos, randomizerStorage);

    ubineticStorage.valid_script = Buffer.from(
      "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
    ).toString("hex");
    ubineticStorage.valid_sources = [alice.pkh, bob.pkh, carol.pkh];

    ubinetic = await Ubinetic.originate(utils.tezos, ubineticStorage);

    gameStorage.randomizer = randomizer.contract.address;
    gameStorage.ubinetic = ubinetic.contract.address;
    gameStorage.uusd_token = uusd.contract.address;

    game = await Game.originate(utils.tezos, gameStorage);
  });

  it("should bet", async () => {
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
    await game.bet();
    await game.updateStorage();

    console.log(game.storage.current_epoch.toFixed());
    console.log(game.storage.entropy);
    console.log(game.storage.random.toFixed());
  });
});
