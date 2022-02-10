import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  uusd_token: zeroAddress,
  randomizer: zeroAddress,
  ubinetic: zeroAddress,
  current_epoch: new BigNumber(0),
  random: new BigNumber(0),
  entropy: "",
};
