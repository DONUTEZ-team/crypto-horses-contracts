import {
  OriginationOperation,
  TransactionOperation,
  WalletParamsWithKind,
  WalletOperationBatch,
  WalletOperation,
  TezosToolkit,
  Contract,
  OpKind,
} from "@taquito/taquito";

import fs from "fs";

import env from "../../env";

import { BigNumber } from "bignumber.js";

import { confirmOperation } from "../../scripts/confirmation";

import gameLambdas from "../../build/lambdas/game_lambdas.json";

import { GameStorage, LaunchRace } from "../types/Game";

export class Game {
  contract: Contract;
  storage: GameStorage;
  tezos: TezosToolkit;

  constructor(contract: Contract, tezos: TezosToolkit) {
    this.contract = contract;
    this.tezos = tezos;
  }

  static async init(gameAddress: string, tezos: TezosToolkit): Promise<Game> {
    return new Game(await tezos.contract.at(gameAddress), tezos);
  }

  static async originate(
    tezos: TezosToolkit,
    storage: GameStorage
  ): Promise<Game> {
    const contract: string = "game";
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

    return new Game(await tezos.contract.at(operation.contractAddress), tezos);
  }

  async updateStorage(maps = {}): Promise<void> {
    const storage: GameStorage = await this.contract.storage();

    this.storage = {
      storage: storage.storage,
      game_lambdas: storage.game_lambdas,
      metadata: storage.metadata,
    };

    for (const key in maps) {
      this.storage.storage[key] = await maps[key].reduce(
        async (prev: any, current: any) => {
          try {
            return {
              ...(await prev),
              [current]: await storage.storage[key].get(current),
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

  async setLambdas(): Promise<void> {
    let params: WalletParamsWithKind[] = [];
    const parts: number = 1;

    for (let i: number = 0; i < gameLambdas.length; ) {
      for (let j: number = 0; j < Math.ceil(gameLambdas.length / parts); ++j) {
        if (i + j >= gameLambdas.length) break;

        params.push({
          kind: OpKind.TRANSACTION,
          ...this.contract.methods
            .setup_func(i + j, gameLambdas[i + j])
            .toTransferParams(),
        });
      }

      const batch: WalletOperationBatch = this.tezos.wallet.batch(params);
      const operation: WalletOperation = await batch.send();

      await confirmOperation(this.tezos, operation.opHash);

      params = [];
      i += Math.ceil(gameLambdas.length / parts);
    }
  }

  async launchRace(params: LaunchRace): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methodsObject
      .launch_race(params)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }

  async setAdmin(admin: string): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .set_admin(admin)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }

  async confirmAdmin(): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .confirm_admin([])
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }

  async setMinRegisterTime(
    minRegisterTime: BigNumber
  ): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .set_min_register_time(minRegisterTime)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }

  async setMinBettingTime(
    minBettingTime: BigNumber
  ): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .set_min_betting_time(minBettingTime)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }
}
