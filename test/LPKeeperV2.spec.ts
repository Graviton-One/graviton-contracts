import { ethers, waffle } from "hardhat"
import { TestERC20 } from "../typechain/TestERC20"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { lpKeeperV2Fixture } from "./shared/fixtures"
import { EVM_CHAIN } from "./shared/utilities"
import { expect } from "./shared/expect"

describe("LPKeeperV2", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let lpKeeper: LPKeeperV2

  beforeEach("deploy test contracts", async () => {
    ;({ token0, token1, token2, balanceKeeper, lpKeeper } = await loadFixture(
      lpKeeperV2Fixture
    ))
  })

  async function openWallet() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(EVM_CHAIN, wallet.address)
  }
  async function openOther() {
    await balanceKeeper.setCanOpen(wallet.address, true)
    await balanceKeeper.open(EVM_CHAIN, other.address)
  }
  async function openToken1() {
    await lpKeeper.setCanOpen(wallet.address, true)
    await lpKeeper.open(EVM_CHAIN, token1.address)
  }
  async function add(token: string, user: string, amount: number) {
    await lpKeeper.setCanAdd(wallet.address, true)
    await lpKeeper["add(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function subtract(token: string, user: string, amount: number) {
    await lpKeeper.setCanSubtract(wallet.address, true)
    await lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function wallet1Token1() {
    await openToken1()
    await openWallet()
    await add(token1.address, wallet.address, 1)
  }
  async function wallet2Token1() {
    await openToken1()
    await openWallet()
    await add(token1.address, wallet.address, 2)
  }
  async function other1Token1() {
    await openToken1()
    await openOther()
    await add(token1.address, other.address, 1)
  }
  async function walletOther1Token1() {
    await openToken1()
    await openWallet()
    await openOther()
    await add(token1.address, wallet.address, 1)
    await add(token1.address, other.address, 1)
  }

  it("constructor initializes variables", async () => {
    expect(await lpKeeper.owner()).to.eq(wallet.address)
  })

  it("starting state after deployment", async () => {
    expect(
      await lpKeeper["isKnownToken(string,bytes)"](EVM_CHAIN, token1.address)
    ).to.eq(false)
    expect(
      await lpKeeper["isKnownToken(string,bytes)"](EVM_CHAIN, token2.address)
    ).to.eq(false)
    expect(
      await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
    ).to.eq(0)
    expect(
      await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token2.address)
    ).to.eq(0)
    expect(
      await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address
      )
    ).to.eq(false)
    expect(
      await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        other.address
      )
    ).to.eq(false)
    expect(
      await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token2.address,
        EVM_CHAIN,
        wallet.address
      )
    ).to.eq(false)
    expect(
      await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token2.address,
        EVM_CHAIN,
        other.address
      )
    ).to.eq(false)
    expect(
      await lpKeeper["balance(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address
      )
    ).to.eq(0)
    expect(
      await lpKeeper["balance(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        other.address
      )
    ).to.eq(0)
    expect(
      await lpKeeper["balance(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token2.address,
        EVM_CHAIN,
        wallet.address
      )
    ).to.eq(0)
    expect(
      await lpKeeper["balance(string,bytes,string,bytes)"](
        EVM_CHAIN,
        token2.address,
        EVM_CHAIN,
        other.address
      )
    ).to.eq(0)
    expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    expect(await lpKeeper.canAdd(other.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    expect(await lpKeeper.canSubtract(other.address)).to.eq(false)
  })

  describe("#setOwner", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setOwner(wallet.address)).to.be
        .reverted
    })

    it("emits a SetOwner event", async () => {
      expect(await lpKeeper.setOwner(other.address))
        .to.emit(lpKeeper, "SetOwner")
        .withArgs(wallet.address, other.address)
    })

    it("updates owner", async () => {
      await lpKeeper.setOwner(other.address)
      expect(await lpKeeper.owner()).to.eq(other.address)
    })

    it("cannot be called by original owner", async () => {
      await lpKeeper.setOwner(other.address)
      await expect(lpKeeper.setOwner(wallet.address)).to.be.reverted
    })
  })

  describe("#setCanAdd", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setCanAdd(wallet.address, true)).to
        .be.reverted
    })

    it("sets permission to true", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, true)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper.setCanAdd(wallet.address, false)
      await lpKeeper.setCanAdd(wallet.address, false)
      expect(await lpKeeper.canAdd(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(lpKeeper.setCanAdd(other.address, true))
        .to.emit(lpKeeper, "SetCanAdd")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#setCanSubtract", () => {
    it("fails if caller is not owner", async () => {
      await expect(lpKeeper.connect(other).setCanSubtract(wallet.address, true))
        .to.be.reverted
    })

    it("sets permission to true", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to true idempotent", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, true)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(true)
    })

    it("sets permission to false", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("sets permission to false idempotent", async () => {
      await lpKeeper.setCanSubtract(wallet.address, false)
      await lpKeeper.setCanSubtract(wallet.address, false)
      expect(await lpKeeper.canSubtract(wallet.address)).to.eq(false)
    })

    it("emits event", async () => {
      await expect(lpKeeper.setCanSubtract(other.address, true))
        .to.emit(lpKeeper, "SetCanSubtract")
        .withArgs(wallet.address, other.address, true)
    })
  })

  describe("#isKnownToken(uint256)", () => {
    it("returns false for the token that is not known", async () => {
      expect(await lpKeeper["isKnownToken(uint256)"](0)).to.eq(false)
    })

    it("returns true for the known token", async () => {
      await openToken1()
      expect(await lpKeeper["isKnownToken(uint256)"](0)).to.eq(true)
    })
  })

  describe("#isKnownToken(string,bytes)", () => {
    it("returns false for the token that is not known", async () => {
      expect(
        await lpKeeper["isKnownToken(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(false)
    })

    it("returns true for the known token", async () => {
      await openToken1()
      expect(
        await lpKeeper["isKnownToken(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(true)
    })
  })

  describe("#tokenChainById", () => {
    it("fails for the token that is not known", async () => {
      await expect(lpKeeper.tokenChainById(0)).to.be.reverted
    })

    it("returns chain for the known token", async () => {
      await openToken1()
      expect(await lpKeeper.tokenChainById(0)).to.eq(EVM_CHAIN)
    })
  })

  describe("#tokenAddressById", () => {
    it("fails for the token that is not known", async () => {
      await expect(lpKeeper.tokenAddressById(0)).to.be.reverted
    })

    it("returns address for the known token", async () => {
      await openToken1()
      expect(await lpKeeper.tokenAddressById(0)).to.eq(
        token1.address.toLowerCase()
      )
    })
  })

  describe("#tokenChainAddressById", () => {
    it("fails for the token that is not known", async () => {
      await expect(lpKeeper.tokenChainAddressById(0)).to.be.reverted
    })

    it("returns chain and address for the known token", async () => {
      await openToken1()
      let chainAddress = await lpKeeper.tokenChainAddressById(0)
      expect(chainAddress[0]).to.eq(EVM_CHAIN)
      expect(chainAddress[1]).to.eq(token1.address.toLowerCase())
    })
  })

  describe("#tokenIdByChainAddress", () => {
    it("fails for the token that is not known", async () => {
      await expect(lpKeeper.tokenIdByChainAddress(EVM_CHAIN, wallet.address)).to
        .be.reverted
    })

    it("returns id for the known token", async () => {
      await openToken1()
      expect(
        await lpKeeper.tokenIdByChainAddress(EVM_CHAIN, token1.address)
      ).to.eq(0)
    })
  })

  describe("#isKnownTokenUser(uint256,uint256)", () => {
    it("returns false when token is not known", async () => {
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](1, 0)).to.eq(
        false
      )
    })

    it("returns false when token is not known and 0 token is known", async () => {
      await wallet1Token1()
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](1, 0)).to.eq(
        false
      )
    })

    it("returns false when token user is not known", async () => {
      await openToken1()
      await openWallet()
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](0, 0)).to.eq(
        false
      )
    })

    it("returns false when token user is not known", async () => {
      await wallet1Token1()
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](0, 1)).to.eq(
        false
      )
    })

    it("returns true when token user is known", async () => {
      await wallet1Token1()
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](0, 0)).to.eq(
        true
      )
    })
  })

  describe("#isKnownTokenUser(string,bytes,uint256)", () => {
    it("returns false when token is not known", async () => {
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token2.address,
          0
        )
      ).to.eq(false)
    })

    it("returns false when token is not known and 0 token is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token2.address,
          0
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          1
        )
      ).to.eq(false)
    })

    it("returns true when token user is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(true)
    })
  })

  describe("#isKnownTokenUser(uint256,string,bytes)", () => {
    it("returns false when token is not known", async () => {
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token is not known and 0 token is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          1,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          other.address
        )
      ).to.eq(false)
    })

    it("returns true when token user is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
    })
  })

  describe("#isKnownTokenUser(string,bytes,string,bytes)", () => {
    it("returns false when token is not known", async () => {
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token is not known and 0 token is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token2.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(false)
    })

    it("returns false when token user is not known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          other.address
        )
      ).to.eq(false)
    })

    it("returns true when token user is known", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
    })
  })

  describe("#tokenUser(uint256,uint256)", () => {
    it("fails if token is not known", async () => {
      await expect(lpKeeper["tokenUser(uint256,uint256)"](0, 0)).to.be.reverted
    })

    it("fails if there are no token users", async () => {
      await openToken1()
      await expect(lpKeeper["tokenUser(uint256,uint256)"](0, 0)).to.be.reverted
    })

    it("fails if userIndex is larger than the number of users", async () => {
      await wallet1Token1()
      await expect(lpKeeper["tokenUser(uint256,uint256)"](0, 1)).to.be.reverted
    })

    it("returns user id", async () => {
      await wallet1Token1()
      expect(await lpKeeper["tokenUser(uint256,uint256)"](0, 0)).to.eq(0)
    })
  })

  describe("#tokenUser(string,bytes,uint256)", () => {
    it("fails if token is not known", async () => {
      await expect(
        lpKeeper["tokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.be.reverted
    })

    it("fails if there are no token users", async () => {
      await openToken1()
      await expect(
        lpKeeper["tokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.be.reverted
    })

    it("fails if userIndex is larger than the number of users", async () => {
      await wallet1Token1()
      await expect(
        lpKeeper["tokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          1
        )
      ).to.be.reverted
    })

    it("returns user id", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["tokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(0)
    })
  })

  describe("#totalTokenUsers(uint256)", () => {
    it("returns 0 if token is not known", async () => {
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(0)
    })

    it("returns 0 if there are no token users", async () => {
      await openToken1()
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(0)
    })

    it("returns the number of token users", async () => {
      await wallet1Token1()
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(1)
    })

    it("returns the number of token users", async () => {
      await walletOther1Token1()
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(2)
    })
  })

  describe("#totalTokenUsers(string,bytes)", () => {
    it("returns 0 if token is not known", async () => {
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(0)
    })

    it("returns 0 if there are no token users", async () => {
      await openToken1()
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(0)
    })

    it("returns the number of token users", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(1)
    })

    it("returns the number of token users", async () => {
      await walletOther1Token1()
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(2)
    })
  })

  describe("#balance(uint256,uint256)", () => {
    it("returns 0 if token is not known", async () => {
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(0)
    })

    it("returns 0 if token user is not known", async () => {
      await openToken1()
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(0)
    })

    it("returns 0 if there is no balance", async () => {
      await wallet1Token1()
      await subtract(token1.address, wallet.address, 1)
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(0)
    })

    it("returns user balance", async () => {
      await wallet1Token1()
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(1)
    })
  })

  describe("#balance(uint256,string,bytes)", () => {
    it("returns 0 if token is not known", async () => {
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns 0 if token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns 0 if there is no balance", async () => {
      await wallet1Token1()
      await subtract(token1.address, wallet.address, 1)
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns user balance", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })
  })

  describe("#balance(string,bytes,uint256)", () => {
    it("returns 0 if token is not known", async () => {
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(0)
    })

    it("returns 0 if token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(0)
    })

    it("returns 0 if there is no balance", async () => {
      await wallet1Token1()
      await subtract(token1.address, wallet.address, 1)
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(0)
    })

    it("returns user balance", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(1)
    })
  })

  describe("#balance(string,bytes,string,bytes)", () => {
    it("returns 0 if token is not known", async () => {
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns 0 if token user is not known", async () => {
      await openToken1()
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns 0 if there is no balance", async () => {
      await wallet1Token1()
      await subtract(token1.address, wallet.address, 1)
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(0)
    })

    it("returns user balance", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })
  })

  describe("#totalBalance(uint256)", () => {
    it("returns 0 if token is not known", async () => {
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(0)
    })

    it("returns 0 if balance is 0", async () => {
      await openToken1()
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(0)
    })

    it("returns token balance", async () => {
      await wallet1Token1()
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(1)
    })

    it("returns token balance", async () => {
      await walletOther1Token1()
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(2)
    })
  })

  describe("#totalBalance(string,bytes)", () => {
    it("returns 0 if token is not known", async () => {
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(0)
    })

    it("returns 0 if balance is 0", async () => {
      await openToken1()
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(0)
    })

    it("returns token balance", async () => {
      await wallet1Token1()
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(1)
    })

    it("returns token balance", async () => {
      await walletOther1Token1()
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(2)
    })
  })

  describe("#open", () => {
    it("fails if caller is not allowed to open", async () => {
      await expect(lpKeeper.open(EVM_CHAIN, token1.address)).to.be.reverted
    })

    it("sets chain for id", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      expect(await lpKeeper.tokenChainById(0)).to.eq(EVM_CHAIN)
    })

    it("sets address for id", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      expect(await lpKeeper.tokenAddressById(0)).to.eq(
        token1.address.toLowerCase()
      )
    })

    it("sets id for chain and address", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      let chainAddress = await lpKeeper.tokenChainAddressById(0)
      expect(chainAddress[0]).to.eq(EVM_CHAIN)
      expect(chainAddress[1]).to.eq(token1.address.toLowerCase())
    })

    it("increments the number of tokens for the chain and address that are not known", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      expect(await lpKeeper.totalTokens()).to.eq(1)
    })

    it("increments the number of tokens for the chain and address that are not known", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.open(EVM_CHAIN, other.address)
      expect(await lpKeeper.totalTokens()).to.eq(2)
    })

    it("does not increment the number of tokens for the known chain and address", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      expect(await lpKeeper.totalTokens()).to.eq(1)
    })

    it("does not increment the number of tokens for the same address in upper and lower case", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await lpKeeper.open(EVM_CHAIN, token1.address)
      await lpKeeper.open(EVM_CHAIN, token1.address.toLowerCase())
      expect(await lpKeeper.totalTokens()).to.eq(1)
    })

    it("emits event", async () => {
      await lpKeeper.setCanOpen(wallet.address, true)
      await expect(lpKeeper.open(EVM_CHAIN, token1.address))
        .to.emit(lpKeeper, "Open")
        .withArgs(wallet.address, 0)
      await expect(lpKeeper.open(EVM_CHAIN, token2.address))
        .to.emit(lpKeeper, "Open")
        .withArgs(wallet.address, 1)
    })
  })

  describe("#add(uint256,uint256,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(lpKeeper["add(uint256,uint256,uint256)"](0, 1, 1)).to.be
        .reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(lpKeeper["add(uint256,uint256,uint256)"](0, 1, 1)).to.be
        .reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await openToken1()
      await expect(lpKeeper["add(uint256,uint256,uint256)"](0, 1, 1)).to.be
        .reverted
    })

    it("records a new user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](0, 0)).to.eq(
        true
      )
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(1)
    })

    it("does not record a known user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["isKnownTokenUser(uint256,uint256)"](0, 0)).to.eq(
        true
      )
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(1)
    })

    it("adds to user balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(1)
    })

    it("adds to total balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await openToken1()
      await openWallet()
      await openOther()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1)
      await lpKeeper["add(uint256,uint256,uint256)"](0, 1, 1)
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(2)
    })

    it("emits event", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(lpKeeper["add(uint256,uint256,uint256)"](0, 0, 1))
        .to.emit(lpKeeper, "Add")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#add(string,bytes,uint256,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(
        lpKeeper["add(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          1,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          1,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["add(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          1,
          1
        )
      ).to.be.reverted
    })

    it("records a new user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(true)
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(1)
    })

    it("does not record a known user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(true)
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(1)
    })

    it("adds to user balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(1)
    })

    it("adds to total balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await openToken1()
      await openWallet()
      await openOther()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      await lpKeeper["add(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        1,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(2)
    })

    it("emits event", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          0,
          1
        )
      )
        .to.emit(lpKeeper, "Add")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#add(uint256,string,bytes,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(
        lpKeeper["add(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["add(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("records a new user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(1)
    })

    it("does not record a known user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
      expect(await lpKeeper["totalTokenUsers(uint256)"](0)).to.eq(1)
    })

    it("adds to user balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })

    it("adds to total balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await openToken1()
      await openWallet()
      await openOther()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      await lpKeeper["add(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        other.address,
        1
      )
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(2)
    })

    it("emits event", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          wallet.address,
          1
        )
      )
        .to.emit(lpKeeper, "Add")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#add(string,bytes,string,bytes,uint256)", () => {
    it("fails if caller is not allowed to add", async () => {
      await expect(
        lpKeeper["add(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanAdd(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["add(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          other.address,
          1
        )
      ).to.be.reverted
    })

    it("records a new user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(1)
    })

    it("does not record a known user", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["isKnownTokenUser(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(true)
      expect(
        await lpKeeper["totalTokenUsers(string,bytes)"](
          EVM_CHAIN,
          token1.address
        )
      ).to.eq(1)
    })

    it("adds to user balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })

    it("adds to total balance", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(1)
    })

    it("adds each value to total balance", async () => {
      await openToken1()
      await openWallet()
      await openOther()
      await lpKeeper.setCanAdd(wallet.address, true)
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      await lpKeeper["add(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        other.address,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(2)
    })

    it("emits event", async () => {
      await openToken1()
      await openWallet()
      await lpKeeper.setCanAdd(wallet.address, true)
      await expect(
        lpKeeper["add(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address,
          1
        )
      )
        .to.emit(lpKeeper, "Add")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#subtract(uint256,uint256,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await wallet2Token1()
      await expect(lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1)).to.be
        .reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1)).to.be
        .reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await openToken1()
      await expect(lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1)).to.be
        .reverted
    })

    it("subtracts from user balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["balance(uint256,uint256)"](0, 0)).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1)
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(1)
    })

    it("emits event", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(lpKeeper["subtract(uint256,uint256,uint256)"](0, 0, 1))
        .to.emit(lpKeeper, "Subtract")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#subtract(string,bytes,uint256,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await wallet2Token1()
      await expect(
        lpKeeper["subtract(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          0,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          0,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["subtract(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          0,
          1
        )
      ).to.be.reverted
    })

    it("subtracts from user balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["balance(string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          0
        )
      ).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(string,bytes,uint256,uint256)"](
        EVM_CHAIN,
        token1.address,
        0,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(1)
    })

    it("emits event", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(string,bytes,uint256,uint256)"](
          EVM_CHAIN,
          token1.address,
          0,
          1
        )
      )
        .to.emit(lpKeeper, "Subtract")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#subtract(uint256,string,bytes,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await wallet2Token1()
      await expect(
        lpKeeper["subtract(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["subtract(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("subtracts from user balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["balance(uint256,string,bytes)"](
          0,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(uint256,string,bytes,uint256)"](
        0,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(await lpKeeper["totalBalance(uint256)"](0)).to.eq(1)
    })

    it("emits event", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(uint256,string,bytes,uint256)"](
          0,
          EVM_CHAIN,
          wallet.address,
          1
        )
      )
        .to.emit(lpKeeper, "Subtract")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })

  describe("#subtract(string,bytes,string,bytes,uint256)", () => {
    it("fails if caller is not allowed to subtract", async () => {
      await wallet2Token1()
      await expect(
        lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if token is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("fails if user is not known", async () => {
      await lpKeeper.setCanSubtract(wallet.address, true)
      await openToken1()
      await expect(
        lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address,
          1
        )
      ).to.be.reverted
    })

    it("subtracts from user balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["balance(string,bytes,string,bytes)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address
        )
      ).to.eq(1)
    })

    it("subtracts from total balance", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
        EVM_CHAIN,
        token1.address,
        EVM_CHAIN,
        wallet.address,
        1
      )
      expect(
        await lpKeeper["totalBalance(string,bytes)"](EVM_CHAIN, token1.address)
      ).to.eq(1)
    })

    it("emits event", async () => {
      await wallet2Token1()
      await lpKeeper.setCanSubtract(wallet.address, true)
      await expect(
        lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
          EVM_CHAIN,
          token1.address,
          EVM_CHAIN,
          wallet.address,
          1
        )
      )
        .to.emit(lpKeeper, "Subtract")
        .withArgs(wallet.address, 0, 0, 1)
    })
  })
})
