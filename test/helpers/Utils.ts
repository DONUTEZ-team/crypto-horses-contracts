import { TransactionOperation, TezosToolkit } from "@taquito/taquito";
import { InMemorySigner } from "@taquito/signer";

import { confirmOperation } from "../../scripts/confirmation";

import env from "../../env";

const defaultNetwork = "development";
const network = env.network || defaultNetwork;

export class Utils {
  tezos: TezosToolkit;

  async init(providerSK: string): Promise<TezosToolkit> {
    const networkConfig = env.networks[network];

    this.tezos = new TezosToolkit(networkConfig.rpc);
    this.tezos.setProvider({
      config: {
        confirmationPollingTimeoutSecond: env.confirmationPollingTimeoutSecond,
      },
      signer: await InMemorySigner.fromSecretKey(providerSK),
    });

    return this.tezos;
  }

  async setProvider(newProviderSK: string): Promise<void> {
    this.tezos.setProvider({
      signer: await InMemorySigner.fromSecretKey(newProviderSK),
    });
  }

  async bakeBlocks(count: number) {
    for (let i: number = 0; i < count; ++i) {
      const operation: TransactionOperation =
        await this.tezos.contract.transfer({
          to: await this.tezos.signer.publicKeyHash(),
          amount: 1,
        });

      await confirmOperation(this.tezos, operation.hash);
    }
  }

  async getLastBlockTimestamp(): Promise<number> {
    return Date.parse((await this.tezos.rpc.getBlockHeader()).timestamp);
  }

  static parseOnChainViewError(json: any[]): string {
    for (let i: number = 0; i < json.length; ++i) {
      for (var key in json[i]) {
        if (key === "with") {
          return json[i][key]["string"];
        }
      }
    }

    return "";
  }
}

export const zeroAddress: string = "tz1ZZZZZZZZZZZZZZZZZZZZZZZZZZZZNkiRg";
