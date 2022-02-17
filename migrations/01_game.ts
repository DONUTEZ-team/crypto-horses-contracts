import { Utils } from "../test/helpers/Utils";
import { Game } from "../test/helpers/Game";

import { gameStorage } from "../storage/Game";

import accounts from "../scripts/sandbox/accounts";

module.exports = async () => {
  const utils: Utils = new Utils();

  await utils.init(accounts.dev.sk);

  gameStorage.storage.uusd_token = "KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3";

  const game: Game = await Game.originate(utils.tezos, gameStorage);

  await game.setLambdas();

  console.log(`Game: ${game.contract.address}`);
};
