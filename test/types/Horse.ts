import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type HorseStorage = {
  ledger:  MichelsonMap<MichelsonMapKey, unknown>;
  token_info: MichelsonMap<MichelsonMapKey, unknown>;
  token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
  races: MichelsonMap<MichelsonMapKey, unknown>;
  free_token: string[];
  pools: MichelsonMap<MichelsonMapKey, unknown>;
  bets: MichelsonMap<MichelsonMapKey, unknown>;
  uusd_token: string;
  ubinetic_proxy: string;
  randomizer_proxy: string;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
  lastTokenId: BigNumber;
};
