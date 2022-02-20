import { ViewSimulationError } from "@taquito/taquito";

import { Utils, zeroAddress } from "../../helpers/Utils";

import { rejects } from "assert";

import chai, { expect } from "chai";

import { BigNumber } from "bignumber.js";

import accounts from "../../../scripts/sandbox/accounts";

import { ubineticProxyStorage } from "../../../storage/UbineticProxy";
import { ubineticStorage } from "../../../storage/test/Ubinetic";

import { UbineticProxy } from "test/helpers/UbineticProxy";
import { Ubinetic } from "test/helpers/Ubinetic";
import {
  Common,
  UbineticProxy as UbineticProxyErrors,
} from "test/helpers/Errors";

import { SBAccount } from "test/types/Common";

chai.use(require("chai-bignumber")(BigNumber));

describe("UbineticProxy", async () => {
  var ubinetic: Ubinetic;
  var utils: Utils;
  var ubineticProxy: UbineticProxy;

  var alice: SBAccount = accounts.alice;
  var bob: SBAccount = accounts.bob;

  before("setup", async () => {
    utils = new Utils();

    await utils.init(alice.sk);

    ubineticStorage.valid_script = Buffer.from(
      "ipfs://QmUNxMtCvWSRKmVeF1hauoYE7qihGEhKiJt9oc5G4H4Dhr"
    ).toString("hex");
    ubineticStorage.valid_sources = [alice.pkh, bob.pkh];

    ubinetic = await Ubinetic.originate(utils.tezos, ubineticStorage);

    await ubinetic.fulfill(
      ubineticStorage.valid_script,
      "986d1ec15619b3321e9b0b3389221f059b28361969d8f82185eafc5675fc45f69721a9439fa47e1a9b4cb40490e07b44"
    );

    ubineticProxyStorage.ubinetic = ubinetic.contract.address;
    ubineticProxyStorage.admin = alice.pkh;

    ubineticProxy = await UbineticProxy.originate(
      utils.tezos,
      ubineticProxyStorage
    );
  });

  it("should fail if not admin is trying to setup new pending admin", async () => {
    await utils.setProvider(bob.sk);
    await rejects(ubineticProxy.setAdmin(bob.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should setup new pending admin by admin", async () => {
    await utils.setProvider(alice.sk);
    await ubineticProxy.setAdmin(bob.pkh);
    await ubineticProxy.updateStorage();

    expect(ubineticProxy.storage.admin).to.equal(alice.pkh);
    expect(ubineticProxy.storage.pending_admin).to.equal(bob.pkh);
  });

  it("should fail if not pending admin is trying to confirm new admin", async () => {
    await rejects(ubineticProxy.confirmAdmin(), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_PENDING_ADMIN);

      return true;
    });
  });

  it("should confirm new admin by pending admin", async () => {
    await utils.setProvider(bob.sk);
    await ubineticProxy.confirmAdmin();
    await ubineticProxy.updateStorage();

    expect(ubineticProxy.storage.admin).to.equal(bob.pkh);
    expect(ubineticProxy.storage.pending_admin).to.equal(zeroAddress);
  });

  it("should fail if not admin is trying to change ubinetic contract address", async () => {
    await utils.setProvider(alice.sk);
    await rejects(ubineticProxy.changeUbinetic(alice.pkh), (err: Error) => {
      expect(err.message).to.equal(Common.ERR_NOT_ADMIN);

      return true;
    });
  });

  it("should change ubinetic contract address by admin", async () => {
    const ubinetic: string = bob.pkh;

    await utils.setProvider(bob.sk);
    await ubineticProxy.changeUbinetic(ubinetic);

    ubineticProxy = await UbineticProxy.init(
      ubineticProxy.contract.address,
      utils.tezos
    );

    await ubineticProxy.updateStorage();

    expect(ubineticProxy.storage.ubinetic).to.equal(ubinetic);
  });

  it("should fail if ubinetic `get_current_epoch` view not found", async () => {
    try {
      await ubineticProxy.contract.contractViews
        .get_current_epoch()
        .executeView({ viewCaller: alice.pkh });
    } catch (err: any) {
      expect(err).to.be.instanceof(ViewSimulationError);
      expect(
        Utils.parseOnChainViewError(JSON.parse(err.originalError.body))
      ).to.be.equal(
        UbineticProxyErrors.ERR_UBINETIC_GET_CURRENT_EPOCH_VIEW_404
      );
    }
  });

  it("should return proper current epoch", async () => {
    await ubineticProxy.changeUbinetic(ubinetic.contract.address);

    ubineticProxy = await UbineticProxy.init(
      ubineticProxy.contract.address,
      utils.tezos
    );

    const currentEpoch: any = await ubineticProxy.contract.contractViews
      .get_current_epoch()
      .executeView({ viewCaller: alice.pkh });

    await ubinetic.updateStorage();

    expect(currentEpoch).to.be.bignumber.equal(ubinetic.storage.current_epoch);
  });

  it("should fail if ubinetic `get_entropy` view not found", async () => {
    await ubineticProxy.changeUbinetic(alice.pkh);

    ubineticProxy = await UbineticProxy.init(
      ubineticProxy.contract.address,
      utils.tezos
    );

    try {
      await ubineticProxy.contract.contractViews
        .get_entropy(new BigNumber(0))
        .executeView({ viewCaller: alice.pkh });
    } catch (err: any) {
      expect(err).to.be.instanceof(ViewSimulationError);
      expect(
        Utils.parseOnChainViewError(JSON.parse(err.originalError.body))
      ).to.be.equal(UbineticProxyErrors.ERR_UBINETIC_GET_ENTROPY_VIEW_404);
    }
  });

  it("should return proper entropy for epoch", async () => {
    await ubineticProxy.changeUbinetic(ubinetic.contract.address);

    ubineticProxy = await UbineticProxy.init(
      ubineticProxy.contract.address,
      utils.tezos
    );

    const epoch: BigNumber = new BigNumber(0);
    const entropy: any = await ubineticProxy.contract.contractViews
      .get_entropy(epoch)
      .executeView({ viewCaller: alice.pkh });

    await ubinetic.updateStorage({ entropies: [epoch] });

    expect(entropy).to.be.equal(ubinetic.storage.entropies[epoch.toFixed()]);
  });
});
