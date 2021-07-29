import { ethers, waffle } from "hardhat"
import { BigNumber, Contract, ContractTransaction } from "ethers"
import { expect } from "./shared/expect"

import { TestERC20 } from "../typechain/TestERC20"
import { ImpactEB } from "../typechain/ImpactEB"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { MockTimeFarmLinear } from "../typechain/MockTimeFarmLinear"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { SharesEB } from "../typechain/SharesEB"
import { SharesLP } from "../typechain/SharesLP"
import { BalanceAdderV2Old } from "../typechain/BalanceAdderV2Old"
import { BalanceAdderV2 } from "../typechain/BalanceAdderV2"
import {
  EVM_CHAIN,
  makeValueImpact,
  EARLY_BIRDS_A,
  EARLY_BIRDS_C,
  STAKING_AMOUNT,
  STAKING_PERIOD,
} from "./shared/utilities"

describe("BalanceAdderV2Old", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let token0: TestERC20
  let token1: TestERC20
  let token2: TestERC20
  let balanceKeeper: BalanceKeeperV2
  let farmStaking: MockTimeFarmLinear
  let impactEB: ImpactEB
  let sharesEB: SharesEB
  let farmEB: MockTimeFarmCurved
  let lpKeeper: LPKeeperV2
  let sharesLP1: SharesLP
  let farmLP1: MockTimeFarmLinear
  let sharesLP2: SharesLP
  let farmLP2: MockTimeFarmLinear
  let balanceAdderV2Old: BalanceAdderV2Old
  let balanceAdderV2: BalanceAdderV2

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
  async function openToken2() {
    await lpKeeper.setCanOpen(wallet.address, true)
    await lpKeeper.open(EVM_CHAIN, token1.address)
  }
  async function addEB(user: string, amount: string) {
    await impactEB
      .connect(nebula)
      .attachValue(
        makeValueImpact(
          token1.address,
          user,
          amount,
          Math.floor(Math.random() * 1000).toString(),
          "0"
        )
      )
  }
  async function addEBn(n: number) {
    for (var i = 0; i < n; i++) {
      var addr = await randomAddress()
      await addEB(addr, "1")
    }
    await balanceKeeper.setCanOpen(sharesEB.address, true)
    while ((await sharesEB.currentUser()) < (await impactEB.userCount())) {
      await sharesEB.migrate(50)
    }
  }
  async function addLP(token: string, user: string, amount: string) {
    await lpKeeper.setCanAdd(wallet.address, true)
    await lpKeeper["add(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
  }
  async function addLPn(token: string, n: number) {
    await balanceKeeper.setCanOpen(wallet.address, true)
    for (var i = 0; i < n; i++) {
      let addr = await randomAddress()
      await balanceKeeper.open("EVM", addr)
      await addLP(token, addr, "1")
    }
  }
  async function farmEBFor(duration: number) {
    await farmEB.startFarming()
    farmEB.advanceTime(duration)
    // farmEB.time().then((time) => console.log(time.toString()))
    await farmEB.unlockAsset()
  }
  async function farmLP1For(duration: number) {
    await farmLP1.startFarming()
    farmLP1.advanceTime(duration)
    // farmEB.time().then((time) => console.log(time.toString()))
    await farmLP1.unlockAsset()
  }
  async function farmLP2For(duration: number) {
    await farmLP2.startFarming()
    farmLP2.advanceTime(duration)
    // farmEB.time().then((time) => console.log(time.toString()))
    await farmLP2.unlockAsset()
  }
  async function farmStakingFor(duration: number) {
    await farmStaking.startFarming()
    farmStaking.advanceTime(duration)
    // farmEB.time().then((time) => console.log(time.toString()))
    await farmStaking.unlockAsset()
  }

  async function gasCost(
    x:
      | ContractTransaction
      | Promise<ContractTransaction>
      | Promise<BigNumber>
      | BigNumber
      | Contract
      | Promise<Contract>
  ): Promise<BigNumber | undefined> {
    const resolved = await x
    if ("deployTransaction" in resolved) {
      const receipt = await resolved.deployTransaction.wait()
      return receipt.gasUsed
    } else if ("wait" in resolved) {
      const waited = await resolved.wait()
      return waited.gasUsed
    } else if (BigNumber.isBigNumber(resolved)) {
      return resolved
    }
  }

  async function randomAddress(): Promise<string> {
    return ethers.utils.hexlify(ethers.utils.randomBytes(20))
  }

  async function deploy() {
    const tokenFactory = await ethers.getContractFactory("TestERC20")
    token0 = (await tokenFactory.deploy(
      BigNumber.from(2).pow(255)
    )) as TestERC20
    token1 = (await tokenFactory.deploy(
      BigNumber.from(2).pow(255)
    )) as TestERC20
    token2 = (await tokenFactory.deploy(
      BigNumber.from(2).pow(255)
    )) as TestERC20

    const balanceKeeperFactory = await ethers.getContractFactory(
      "BalanceKeeperV2"
    )
    balanceKeeper = (await balanceKeeperFactory.deploy()) as BalanceKeeperV2

    const farmStakingFactory = await ethers.getContractFactory(
      "MockTimeFarmLinear"
    )
    farmStaking = (await farmStakingFactory.deploy(
      STAKING_AMOUNT,
      STAKING_PERIOD,
      0
    )) as MockTimeFarmLinear

    const impactEBFactory = await ethers.getContractFactory("ImpactEB")
    impactEB = (await impactEBFactory.deploy(wallet.address, nebula.address, [
      token1.address,
      token2.address,
    ])) as ImpactEB

    const sharesEBFactory = await ethers.getContractFactory("SharesEB")
    sharesEB = (await sharesEBFactory.deploy(
      balanceKeeper.address,
      impactEB.address
    )) as SharesEB

    const farmEBFactory = await ethers.getContractFactory("MockTimeFarmCurved")
    farmEB = (await farmEBFactory.deploy(
      EARLY_BIRDS_A,
      EARLY_BIRDS_C,
      0
    )) as MockTimeFarmCurved

    const lpKeeperFactory = await ethers.getContractFactory("LPKeeperV2")
    lpKeeper = (await lpKeeperFactory.deploy(
      balanceKeeper.address
    )) as LPKeeperV2

    await lpKeeper.setCanOpen(wallet.address, true)
    await lpKeeper.open(EVM_CHAIN, token1.address)
    await lpKeeper.open(EVM_CHAIN, token2.address)

    const sharesLPFactory = await ethers.getContractFactory("SharesLP")
    sharesLP1 = (await sharesLPFactory.deploy(lpKeeper.address, 0)) as SharesLP

    const farmLPFactory = await ethers.getContractFactory("MockTimeFarmLinear")
    farmLP1 = (await farmLPFactory.deploy(
      STAKING_AMOUNT,
      STAKING_PERIOD,
      0
    )) as MockTimeFarmLinear

    sharesLP2 = (await sharesLPFactory.deploy(lpKeeper.address, 1)) as SharesLP

    farmLP2 = (await farmLPFactory.deploy(
      STAKING_AMOUNT,
      STAKING_PERIOD,
      0
    )) as MockTimeFarmLinear
  }
  async function processBalancesV2OldCost(): Promise<BigNumber> {
    var gas: BigNumber = BigNumber.from("0")
    gas = gas.add((await gasCost(balanceAdderV2Old.processBalances(50))) ?? 0)
    let zeroFarm = async () =>
      (await balanceAdderV2Old.currentFarm()).eq(BigNumber.from(0))
    let zeroUser = async () =>
      (await balanceAdderV2Old.currentUser()).eq(BigNumber.from(0))
    while (true) {
      gas = gas.add((await gasCost(balanceAdderV2Old.processBalances(50))) ?? 0)
      if ((await zeroFarm()) && (await zeroUser())) {
        break
      }
    }
    return gas
  }
  async function processBalancesV2Cost(): Promise<BigNumber> {
    var gas: BigNumber = BigNumber.from("0")
    gas = gas.add((await gasCost(balanceAdderV2.processBalances(50))) ?? 0)
    let zeroFarm = async () =>
      (await balanceAdderV2.currentFarm()).eq(BigNumber.from(0))
    let zeroUser = async () =>
      (await balanceAdderV2.currentUser()).eq(BigNumber.from(0))
    while (true) {
      gas = gas.add((await gasCost(balanceAdderV2.processBalances(50))) ?? 0)
      if ((await zeroFarm()) && (await zeroUser())) {
        break
      }
    }
    return gas
  }

  describe("#V2Old", () => {
    beforeEach("deploy test contracts", async () => {
      await deploy()
      const balanceAdderFactory = await ethers.getContractFactory(
        "BalanceAdderV2Old"
      )
      balanceAdderV2Old = (await balanceAdderFactory.deploy(
        balanceKeeper.address
      )) as BalanceAdderV2Old
    })

    it("EB", async () => {
      await addEBn(10)
      await farmEBFor(604800)
      await balanceAdderV2Old.addFarm(sharesEB.address, farmEB.address)

      await balanceKeeper.setCanAdd(balanceAdderV2Old.address, true)
      console.log((await processBalancesV2OldCost()).toString())
    })

    it("EB->LP1->LP2", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await openToken2()

      await addEBn(10)
      await farmEBFor(604800)
      await balanceAdderV2Old.addFarm(sharesEB.address, farmEB.address)

      await balanceAdderV2Old.addFarm(sharesLP1.address, farmLP1.address)
      await addLPn(token1.address, 10)
      await farmLP1For(604800)

      await balanceAdderV2Old.addFarm(sharesLP2.address, farmLP2.address)
      await addLPn(token2.address, 10)
      await farmLP2For(604800)

      await balanceKeeper.setCanAdd(balanceAdderV2Old.address, true)
      console.log((await processBalancesV2OldCost()).toString())
    })
  })

  describe("#V2", () => {
    beforeEach("deploy test contracts", async () => {
      await deploy()
      const balanceAdderFactory = await ethers.getContractFactory(
        "BalanceAdderV2"
      )
      balanceAdderV2 = (await balanceAdderFactory.deploy(
        balanceKeeper.address
      )) as BalanceAdderV2
    })

    it("EB", async () => {
      await addEBn(10)
      await farmEBFor(604800)
      await balanceAdderV2.addFarm(sharesEB.address, farmEB.address)

      await balanceKeeper.setCanAdd(balanceAdderV2.address, true)
      console.log((await processBalancesV2Cost()).toString())
    })

    it("EB->LP1->LP2", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await openToken2()

      await addEBn(10)
      await farmEBFor(604800)
      await balanceAdderV2.addFarm(sharesEB.address, farmEB.address)

      await balanceAdderV2.addFarm(sharesLP1.address, farmLP1.address)
      await addLPn(token1.address, 10)
      await farmLP1For(604800)

      await balanceAdderV2.addFarm(sharesLP2.address, farmLP2.address)
      await addLPn(token2.address, 10)
      await farmLP2For(604800)

      await balanceKeeper.setCanAdd(balanceAdderV2.address, true)
      console.log((await processBalancesV2Cost()).toString())
    })
  })
})
