import { MichelsonMap } from "@taquito/michelson-encoder";

import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  storage: {
    uusd_token: zeroAddress,
    randomizer: zeroAddress,
    ubinetic: zeroAddress,
    admin: zeroAddress,
    pending_admin: zeroAddress,
    races_count: new BigNumber(0),
  },
  game_lambdas: MichelsonMap.fromLiteral({}),
  metadata: MichelsonMap.fromLiteral({}),
};
