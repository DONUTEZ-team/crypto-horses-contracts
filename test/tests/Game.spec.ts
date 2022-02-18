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

    gameStorage.storage.randomizer = randomizer.contract.address;
    gameStorage.storage.ubinetic = ubinetic.contract.address;
    gameStorage.storage.uusd_token = uusd.contract.address;

    game = await Game.originate(utils.tezos, gameStorage);
  });
});
