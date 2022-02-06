import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  ubinetic_oracle: zeroAddress,
  uusd_token: zeroAddress,
  random: new BigNumber(0),
};
