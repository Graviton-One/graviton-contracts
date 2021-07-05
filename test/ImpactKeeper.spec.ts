import { ethers, waffle } from "hardhat"
import { ImpactKeeperTest } from "../typechain/ImpactKeeperTest"
import { TestERC20 } from "../typechain/TestERC20"
import { impactKeeperFixture } from "./shared/fixtures"

import { expect } from "./shared/expect"

describe("ImpactKeeper", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let impactKeeper: ImpactKeeperTest

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, impactKeeper } = await loadFixture(
      impactKeeperFixture
    ))
  })

  it("constructor initializes variables", async () => {
    expect(await impactKeeper.owner()).to.eq(wallet.address)
    expect(await impactKeeper.nebula()).to.eq(nebula.address)
    expect(await impactKeeper.allowedTokens(token1.address)).to.eq(true)
    expect(await impactKeeper.allowedTokens(token2.address)).to.eq(true)
  })

  it("starting state after deployment", async () => {
    expect(await impactKeeper.totalSupply()).to.eq(0)
    expect(await impactKeeper.userCount()).to.eq(0)
  })

  describe("#transferOwnership", () => {
    it("fails if caller is not owner", async () => {
      await expect(
        impactKeeper.connect(other).transferOwnership(wallet.address)
      ).to.be.reverted
    })

    it("updates owner", async () => {
      await impactKeeper.transferOwnership(other.address)
      expect(await impactKeeper.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await impactKeeper.transferOwnership(other.address)
      await expect(impactKeeper.transferOwnership(wallet.address)).to.be
        .reverted
    })
  })

  describe("#transferNebula", () => {
    it("fails if caller is not owner", async () => {
      await expect(impactKeeper.connect(other).transferNebula(other.address)).to
        .be.reverted
    })

    it("updates nebula", async () => {
      await impactKeeper.transferNebula(other.address)
      await expect(await impactKeeper.nebula()).to.eq(other.address)
    })
  })

  describe("#addNewToken", () => {
    it("fails if caller is not owner", async () => {
      await expect(impactKeeper.connect(other).addNewToken(other.address)).to.be
        .reverted
    })

    it("updates token", async () => {
      await expect(await impactKeeper.allowedTokens(other.address)).to.eq(false)
      await impactKeeper.addNewToken(other.address)
      await expect(await impactKeeper.allowedTokens(other.address)).to.eq(true)
    })
  })

  describe("#removeToken", () => {
    it("fails if caller is not owner", async () => {
      await expect(impactKeeper.connect(other).removeToken(token1.address)).to
        .be.reverted
    })

    it("updates token", async () => {
      await impactKeeper.removeToken(token1.address)
      await expect(await impactKeeper.allowedTokens(token1.address)).to.eq(
        false
      )
    })
  })

  describe("#deserializeUint", () => {
    it("fails if starting position is larger than bytes length", async () => {
      let b = ethers.utils.arrayify("0xff")
      await expect(impactKeeper.deserializeUint(b, 2, 1)).to.be.reverted
    })

    it("fails if len is larger than bytes length", async () => {
      let b = ethers.utils.arrayify("0xff")
      await expect(impactKeeper.deserializeUint(b, 0, 2)).to.be.reverted
    })

    it("returns 0 when bytes are empty", async () => {
      let b = ethers.utils.arrayify("0x")
      await expect(await impactKeeper.deserializeUint(b, 0, 0)).to.eq(0)
    })

    it("deserializes small number", async () => {
      let b = ethers.utils.arrayify("0x01")
      await expect(await impactKeeper.deserializeUint(b, 0, 1)).to.eq(1)
    })

    it("deserializes large number", async () => {
      let b = ethers.utils.arrayify(wallet.address)
      await expect(await impactKeeper.deserializeUint(b, 0, 1)).to.eq(243)
    })
  })

  describe("#deserializeAddress", () => {
    it("fails if bytes length is less than 20", async () => {
      let b = ethers.utils.arrayify("0xff")
      await expect(impactKeeper.deserializeAddress(b, 2)).to.be.reverted
    })

    it("fails if starting position leaves less than 20 bytes", async () => {
      let b = ethers.utils.arrayify(
        "0x63b323fcf5e116597d96558a91601f94b1f80396"
      )
      await expect(impactKeeper.deserializeAddress(b, 10)).to.be.reverted
    })

    it("deserializes address", async () => {
      let b = ethers.utils.arrayify(
        "0x63b323fcf5e116597d96558a91601f94b1f80396"
      )
      await expect(await impactKeeper.deserializeAddress(b, 0)).to.eq(
        "0x63b323FcF5e116597D96558A91601f94b1F80396"
      )
    })
  })

  describe("#attachValue", () => {
    it("fails if caller is not nebula", async () => {
      let b = ethers.utils.arrayify("0xff")
      await expect(impactKeeper.connect(other).attachValue(b)).to.be.reverted
    })
    it("succeeds if caller is nebula", async () => {
      let b = ethers.utils.arrayify("0xff")
      await impactKeeper.connect(nebula).attachValue(b)
    })
  })
})
