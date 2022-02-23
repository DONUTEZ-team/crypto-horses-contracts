import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

export type GameStorage = {
  storage: {
    races: MichelsonMap<MichelsonMapKey, unknown>;
    ledger: MichelsonMap<MichelsonMapKey, unknown>;
    accounts: MichelsonMap<MichelsonMapKey, unknown>;
    token_info: MichelsonMap<MichelsonMapKey, unknown>;
    token_metadata: MichelsonMap<MichelsonMapKey, unknown>;
    free_token: string[];
    uusd_token: string;
    ubinetic_proxy: string;
    randomizer_proxy: string;
    admin: string;
    pending_admin: string;
    races_count: BigNumber;
    min_registration_period: BigNumber;
    min_betting_period: BigNumber;
    tokens_count: BigNumber;
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

export type Race = {
  bids: MichelsonMap<MichelsonMapKey, unknown>;
  participants: MichelsonMap<MichelsonMapKey, unknown>;
  name: string;
  location: string;
  rid: BigNumber;
  registration_fee: BigNumber;
  min_bid: BigNumber;
  bid_step: BigNumber;
  max_participants_count: BigNumber;
  participants_count: BigNumber;
  registration_start: string;
  betting_start: string;
  race_start: string;
};
