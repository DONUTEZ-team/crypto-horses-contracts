import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export type RandomizerStorage = {
  metadata: MichelsonMap<MichelsonMapKey, unknown>;
  bytes_to_nat: MichelsonMap<MichelsonMapKey, unknown>;
  admins: string[];
  entropy: string;
};
