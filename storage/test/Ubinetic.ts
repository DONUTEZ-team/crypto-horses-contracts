import { MichelsonMap } from "@taquito/michelson-encoder";

import { BigNumber } from "bignumber.js";

import { UbineticStorage } from "../../test/types/Ubinetic";

export const ubineticStorage: UbineticStorage = {
  entropies: MichelsonMap.fromLiteral({}),
  valid_sources: [],
  valid_script: "",
  current_epoch: new BigNumber(0),
};
