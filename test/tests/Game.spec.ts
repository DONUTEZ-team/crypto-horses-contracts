import { Utils } from "../helpers/Utils";

import chai from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../scripts/sandbox/accounts";

import { ubineticStorage } from "../../storage/test/Ubinetic";
import { fa2Storage } from "../../storage/test/FA2";
import { gameStorage } from "../../storage/Game";

import { Ubinetic } from "test/helpers/Ubinetic";
import { SBAccount } from "test/types/Common";
import { Game } from "test/helpers/Game";
import { FA2 } from "test/helpers/FA2";

chai.use(require("chai-bignumber")(BigNumber));

describe("Game", async () => {
  var ubinetic: Ubinetic;
  var uusd: FA2;
  var utils: Utils;
  var game: Game;

  var alice: SBAccount = accounts.alice;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    uusd = await FA2.originate(utils.tezos, fa2Storage);

    ubineticStorage.valid_script = Buffer.from(
      "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
    ).toString("hex");
    ubineticStorage.valid_sources = [alice.pkh];

    ubinetic = await Ubinetic.originate(utils.tezos, ubineticStorage);

    gameStorage.uusd_token = uusd.contract.address;
    gameStorage.ubinetic = ubinetic.contract.address;

    console.log(ubinetic.contract.address);

    game = await Game.originate(utils.tezos, gameStorage);
  });

  it("should not fail", async () => {
    await game.bet(
      Buffer.from(
        "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
      ).toString("hex"),
      "0248c048a3565d90160886ce20987e1df7db3517c83ba7638633fb367bb8a9f4433a333dbcb1e1ffa9331f003fa31c11"
    );
    await game.bet(
      Buffer.from(
        "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
      ).toString("hex"),
      "0248c048a3565d90160886ce20987e1df7db3517c83ba7638633fb367bb8a9f4433a333dbcb1e1ffa9331f003fa31c12"
    );

    const currentEpoch: BigNumber = await ubinetic.contract.contractViews
      .get_current_epoch([])
      .executeView({ viewCaller: alice.pkh });

    console.log(currentEpoch.toFixed());

    await ubinetic.updateStorage({
      entropies: [currentEpoch.toFixed()],
    });

    console.log(ubinetic.storage.entropies);
    console.log(ubinetic.storage.entropies[currentEpoch.toFixed()]);
    console.log(
      Buffer.from(
        ubinetic.storage.entropies[currentEpoch.toFixed()],
        "hex"
      ).toString()
    );
  });
});
