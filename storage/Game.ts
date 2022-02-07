import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  uusd_token: zeroAddress,
  ubinetic: zeroAddress,
  random: new BigNumber(0),
};
