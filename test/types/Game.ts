import { BigNumber } from "bignumber.js";

export type GameStorage = {
  uusd_token: string;
  randomizer: string;
  ubinetic: string;
  entropy: string;
  current_epoch: BigNumber;
  random: BigNumber;
};
