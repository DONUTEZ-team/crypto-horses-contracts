import { OriginationOperation, TezosToolkit, Contract } from "@taquito/taquito";

import fs from "fs";

import { confirmOperation } from "../../scripts/confirmation";

import { UbineticStorage } from "../types/Ubinetic";

export class Ubinetic {
  contract: Contract;
  storage: UbineticStorage;
  tezos: TezosToolkit;

  constructor(contract: Contract, tezos: TezosToolkit) {
    this.contract = contract;
    this.tezos = tezos;
  }

  static async init(
    ubineticAddress: string,
    tezos: TezosToolkit
  ): Promise<Ubinetic> {
    return new Ubinetic(await tezos.contract.at(ubineticAddress), tezos);
  }

  static async originate(
    tezos: TezosToolkit,
    storage: UbineticStorage
  ): Promise<Ubinetic> {
    const artifacts: any = fs
      .readFileSync(`contracts/compiled/ubinetic.tz`)
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

    return new Ubinetic(
      await tezos.contract.at(operation.contractAddress),
      tezos
    );
  }

  async updateStorage(maps = {}): Promise<void> {
    const storage: UbineticStorage = await this.contract.storage();

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
