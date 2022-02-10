import { OriginationOperation, TezosToolkit, Contract } from "@taquito/taquito";

import fs from "fs";

import { confirmOperation } from "../../scripts/confirmation";

import { RandomizerStorage } from "../types/Randomizer";

export class Randomizer {
  contract: Contract;
  storage: RandomizerStorage;
  tezos: TezosToolkit;

  constructor(contract: Contract, tezos: TezosToolkit) {
    this.contract = contract;
    this.tezos = tezos;
  }

  static async init(
    randomizerAddress: string,
    tezos: TezosToolkit
  ): Promise<Randomizer> {
    return new Randomizer(await tezos.contract.at(randomizerAddress), tezos);
  }

  static async originate(
    tezos: TezosToolkit,
    storage: RandomizerStorage
  ): Promise<Randomizer> {
    const artifacts: any = fs
      .readFileSync(`contracts/compiled/randomizer.tz`)
      .toString();
    const operation: OriginationOperation = await tezos.contract
      .originate({
        code: artifacts,
        storage: storage,
      })
      .catch((e) => {
        console.error(e);

        return null;
      });

    await confirmOperation(tezos, operation.hash);

    return new Randomizer(
      await tezos.contract.at(operation.contractAddress),
      tezos
    );
  }

  async updateStorage(maps = {}): Promise<void> {
    const storage: RandomizerStorage = await this.contract.storage();

    this.storage = storage;

    for (const key in maps) {
      this.storage[key] = await maps[key].reduce(
        async (prev: any, current: any) => {
          try {
            return {
              ...(await prev),
              [current]: await storage[key].get(current),
            };
          } catch (ex) {
            return {
              ...(await prev),
              [current]: 0,
            };
          }
        },
        Promise.resolve({})
      );
    }
  }
}
