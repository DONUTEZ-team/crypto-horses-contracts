import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type GameStorage = {
  storage: {
    races: MichelsonMap<MichelsonMapKey, unknown>;
    uusd_token: string;
    ubinetic_proxy: string;
    randomizer_proxy: string;
    horse_nft: string;
    admin: string;
    pending_admin: string;
    races_count: BigNumber;
    min_registration_period: BigNumber;
    min_betting_period: BigNumber;
  };
  game_lambdas: MichelsonMap<MichelsonMapKey, unknown>;
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
};

export type LaunchRace = {
  name: string;
  location: string;
  registration_fee: BigNumber;
  min_bid: BigNumber;
  bid_step: BigNumber;
  max_participants_count: BigNumber;
  registration_start: string;
  betting_start: string;
  race_start: string;
};
