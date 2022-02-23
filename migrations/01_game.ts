import { UbineticProxy } from "../test/helpers/UbineticProxy";
import { Ubinetic } from "../test/helpers/Ubinetic";
import { Utils } from "../test/helpers/Utils";
import { Game } from "../test/helpers/Game";

import { ubineticProxyStorage } from "../storage/UbineticProxy";
import { gameStorage } from "../storage/Game";

import accounts from "../scripts/sandbox/accounts";

import { BigNumber } from "bignumber.js";

module.exports = async () => {
  const utils: Utils = new Utils();

  await utils.init(accounts.dev.sk);

  const ubinetic: Ubinetic = await Ubinetic.init(
    "KT1DMrr8pgcdrPnqxkfqwXSQuVg9mP8v5ShV",
    utils.tezos
  );

  ubineticProxyStorage.ubinetic = ubinetic.contract.address;
  ubineticProxyStorage.admin = accounts.dev.pkh;

  const ubineticProxy: UbineticProxy = await UbineticProxy.originate(
    utils.tezos,
    ubineticProxyStorage
  );

  console.log(`UbineticProxy: ${ubineticProxy.contract.address}`);

  gameStorage.storage.uusd_token = "KT1PiqMJSEsZkFruWMKMpoAmRVumKk9LavX3";
  gameStorage.storage.ubinetic_proxy = ubineticProxy.contract.address;
  gameStorage.storage.admin = accounts.dev.pkh;
  gameStorage.storage.min_registration_period = new BigNumber(36000); // 10 minutes
  gameStorage.storage.min_betting_period = new BigNumber(36000); // 10 minutes

  const game: Game = await Game.originate(utils.tezos, gameStorage);

  await game.setLambdas();

  console.log(`Game: ${game.contract.address}`);
};
