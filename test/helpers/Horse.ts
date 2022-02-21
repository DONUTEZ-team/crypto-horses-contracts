import {
  OriginationOperation,
  TransactionOperation,
  TezosToolkit,
  Contract,
} from "@taquito/taquito";

import fs from "fs";

import env from "../../env";

import { confirmOperation } from "../../scripts/confirmation";

import { HorseStorage } from "../types/Horse";
import { MichelsonMap, MichelsonMapKey } from "@taquito/michelson-encoder";

export class Horse {
  contract: Contract;
  storage: HorseStorage;
  tezos: TezosToolkit;

  constructor(contract: Contract, tezos: TezosToolkit) {
    this.contract = contract;
    this.tezos = tezos;
  }

  static async init(
    horseAddress: string,
    tezos: TezosToolkit
  ): Promise<Horse> {
    return new Horse(
      await tezos.contract.at(horseAddress),
      tezos
    );
  }

  static async originate(
    tezos: TezosToolkit,
    storage: HorseStorage
  ): Promise<Horse> {
    const contract: string = "horse";
    let artifacts: any = JSON.parse(
      fs.readFileSync(`${env.buildDir}/${contract}.json`).toString()
    );
    const operation: OriginationOperation = await tezos.contract
      .originate({
        code: artifacts.michelson,
        storage: storage,
      })
      .catch((e) => {
        console.error(e);

        return null;
      });

    artifacts.networks[env.network] = { [contract]: operation.contractAddress };

    if (!fs.existsSync(env.buildDir)) {
      fs.mkdirSync(env.buildDir);
    }

    fs.writeFileSync(
      `${env.buildDir}/${contract}.json`,
      JSON.stringify(artifacts, null, 2)
    );

    await confirmOperation(tezos, operation.hash);

    return new Horse(
      await tezos.contract.at(operation.contractAddress),
      tezos
    );
  }

  async updateStorage(maps = {}): Promise<void> {
    const storage: HorseStorage = await this.contract.storage();

    this.storage = await this.contract.storage();

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

  async bet(race_id: any, hrs_id : any, amt: any): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .bet(race_id, hrs_id, amt)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }
  async mint_token(name: string, metadata_param: MichelsonMap<MichelsonMapKey, unknown>): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .mint_token(name, metadata_param)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }
}
