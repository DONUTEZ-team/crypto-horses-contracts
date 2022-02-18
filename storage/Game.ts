import { MichelsonMap } from "@taquito/michelson-encoder";

import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { GameStorage } from "../test/types/Game";

export const gameStorage: GameStorage = {
  storage: {
    races: MichelsonMap.fromLiteral({}),
    uusd_token: zeroAddress,
    ubinetic_proxy: zeroAddress,
    randomizer_proxy: zeroAddress,
    horse_nft: zeroAddress,
    admin: zeroAddress,
    pending_admin: zeroAddress,
    races_count: new BigNumber(0),
    min_registration_period: new BigNumber(0),
    min_betting_period: new BigNumber(0),
  },
  game_lambdas: MichelsonMap.fromLiteral({}),
  metadata: MichelsonMap.fromLiteral({}),
};
