import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type GameStorage = {
  storage: {
    uusd_token: string;
    randomizer: string;
    ubinetic: string;
    admin: string;
    pending_admin: string;
    races_count: BigNumber;
  };
  game_lambdas: MichelsonMap<MichelsonMapKey, unknown>;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
};
