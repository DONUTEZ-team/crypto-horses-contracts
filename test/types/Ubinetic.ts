import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type UbineticStorage = {
  entropies: MichelsonMap<MichelsonMapKey, unknown>;
  valid_sources: string[];
  valid_script: string;
  current_epoch: BigNumber;
};
