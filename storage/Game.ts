import { MichelsonMap } from "@taquito/michelson-encoder";

import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  storage: {
    races: MichelsonMap.fromLiteral({}),
    ledger: MichelsonMap.fromLiteral({}),
    accounts: MichelsonMap.fromLiteral({}),
    token_info: MichelsonMap.fromLiteral({}),
    token_metadata: MichelsonMap.fromLiteral({}),
    free_token: [],
    uusd_token: zeroAddress,
    ubinetic_proxy: zeroAddress,
    randomizer_proxy: zeroAddress,
    admin: zeroAddress,
    pending_admin: zeroAddress,
    races_count: new BigNumber(0),
    min_registration_period: new BigNumber(0),
    min_betting_period: new BigNumber(0),
    tokens_count: new BigNumber(0),
  },
  game_lambdas: MichelsonMap.fromLiteral({}),
  metadata: MichelsonMap.fromLiteral({}),
};
