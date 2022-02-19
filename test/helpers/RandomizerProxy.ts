import {
  OriginationOperation,
  TransactionOperation,
  TezosToolkit,
  Contract,
} from "@taquito/taquito";

import fs from "fs";

import env from "../../env";

import { confirmOperation } from "../../scripts/confirmation";

import { RandomizerProxyStorage } from "../types/RandomizerProxy";

export class RandomizerProxy {
  contract: Contract;
  storage: RandomizerProxyStorage;
  tezos: TezosToolkit;

  constructor(contract: Contract, tezos: TezosToolkit) {
    this.contract = contract;
    this.tezos = tezos;
  }

  static async init(
    randomizerProxyAddress: string,
    tezos: TezosToolkit
  ): Promise<RandomizerProxy> {
    return new RandomizerProxy(
      await tezos.contract.at(randomizerProxyAddress),
      tezos
    );
  }

  static async originate(
    tezos: TezosToolkit,
    storage: RandomizerProxyStorage
  ): Promise<RandomizerProxy> {
    const contract: string = "randomizer_proxy";
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

    return new RandomizerProxy(
      await tezos.contract.at(operation.contractAddress),
      tezos
    );
  }

  async updateStorage(): Promise<void> {
    this.storage = await this.contract.storage();
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

  async changeRandomizer(randomizer: string): Promise<TransactionOperation> {
    const operation: TransactionOperation = await this.contract.methods
      .change_randomizer(randomizer)
      .send();

    await confirmOperation(this.tezos, operation.hash);

    return operation;
  }
}
