import { MichelsonMap } from "@taquito/michelson-encoder";

import { zeroAddress } from "../test/helpers/Utils";

import { BigNumber } from "bignumber.js";

import { HorseStorage } from "../test/types/Horse";

export const horseStorage: HorseStorage = {
  ledger: MichelsonMap.fromLiteral({}),
  token_info:MichelsonMap.fromLiteral({}),
  token_metadata:MichelsonMap.fromLiteral({}),
  races: MichelsonMap.fromLiteral({
    0: {
      participants_count: 2,
      max_participants_count: 10,
      betting_start: "2000-01-01t10:10:10Z",
      random: 0,
      race_start: "2000-01-01t10:10:10Z"
    }
  }),
  free_token: [],
  pools:MichelsonMap.fromLiteral({}),
  bets:MichelsonMap.fromLiteral({}),
  uusd_token: zeroAddress,
  ubinetic_proxy: zeroAddress,
  randomizer_proxy: zeroAddress,
  metadata: MichelsonMap.fromLiteral({}),
  lastTokenId: new BigNumber(0),
};
