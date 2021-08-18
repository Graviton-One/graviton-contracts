import { ethers, waffle } from "hardhat"
import { BigNumber } from "ethers"
import { expect } from "./shared/expect"

import { TestERC20 } from "../typechain/TestERC20"
import { ImpactEB } from "../typechain/ImpactEB"
import { MockTimeFarmCurved } from "../typechain/MockTimeFarmCurved"
import { MockTimeFarmLinear } from "../typechain/MockTimeFarmLinear"
import { BalanceKeeperV2 } from "../typechain/BalanceKeeperV2"
import { LPKeeperV2 } from "../typechain/LPKeeperV2"
import { SharesEB } from "../typechain/SharesEB"
import { SharesLP } from "../typechain/SharesLP"
import { BalanceAdderV2 } from "../typechain/BalanceAdderV2"
import { balanceAdderV2Fixture } from "./shared/fixtures"
import {
  EVM_CHAIN,
  makeValueImpact,
  expandTo18Decimals,
} from "./shared/utilities"

describe("BalanceAdderV2", () => {
  const [wallet, other, nebula] = waffle.provider.getWallets()

  let loadFixture: ReturnType<typeof waffle.createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = waffle.createFixtureLoader([wallet, other, nebula])
  })

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
  let balanceAdder: BalanceAdderV2

  beforeEach("deploy test contracts", async () => {
    ;({
      token0,
      token1,
      token2,
      balanceKeeper,
      farmStaking,
      impactEB,
      sharesEB,
      farmEB,
      lpKeeper,
      sharesLP1,
      farmLP1,
      sharesLP2,
      farmLP2,
      balanceAdder,
    } = await loadFixture(balanceAdderV2Fixture))
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
  async function add(user: string, amount: string) {
    await balanceKeeper.setCanAdd(wallet.address, true)
    await balanceKeeper["add(string,bytes,uint256)"](EVM_CHAIN, user, amount)
  }
  async function subtract(user: string, amount: string) {
    await balanceKeeper.setCanSubtract(wallet.address, true)
    await balanceKeeper["subtract(string,bytes,uint256)"](
      EVM_CHAIN,
      user,
      amount
    )
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
  async function subtractLP(token: string, user: string, amount: string) {
    await lpKeeper.setCanSubtract(wallet.address, true)
    await lpKeeper["subtract(string,bytes,string,bytes,uint256)"](
      EVM_CHAIN,
      token,
      EVM_CHAIN,
      user,
      amount
    )
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

  describe("#EB", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(604800)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("96044673105003010055905") //  96044.673105003010055905
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "96044673105003010055905"
      ) //  96044.673105003010055905
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "72033504828752257541928"
      ) //  72033.504828752257541928
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "24011168276250752513976"
      ) //  24011.168276250752513976
      await farmEBFor(604800)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("183688261375906802671116") // 183688.261375906802671116
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "183688261375906802671116"
      ) // 183688.261375906802671116
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "137766196031930102003336"
      ) // 137766.196031930102003336
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "45922065343976700667778"
      ) //  45922.065343976700667779
    })

    it("unlocks after two weeks", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(1209600)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("183688261375906802671116")
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "183688261375906802671116"
      ) // 183688.261375906802671116
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "137766196031930102003337"
      ) // 137766.196031930102003337
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "45922065343976700667779"
      ) //  45922.065343976700667779
    })

    it("unlocks after four weeks", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(2419200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("337826626283123222944472")
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "337826626283123222944472"
      ) // 337826.626283123222944472
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "253369969712342417208354"
      ) // 253369.969712342417208354
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "84456656570780805736118"
      ) //  84456.656570780805736118
    })

    it("unlocks after six months", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(14515200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("1123374512487256187667572")
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "1123374512487256187667572"
      ) // 337826.626283123222944472
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "842530884365442140750679"
      ) // 842530.884365442140750679
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "280843628121814046916893"
      ) // 280843.628121814046916893
    })

    it("unlocks after a year", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(31536000)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmEB.totalUnlocked()).to.be.eq("1499842209403393520254556")
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        "1499842209403393520254556"
      ) // 1499842.209403393520254556
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "1124881657052545140190917"
      ) // 1124881.657052545140190917
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "374960552350848380063639"
      ) //  374960.552350848380063639
    })
  })

  describe("#LP", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(604800)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(7000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(5250)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(1750)
      )
    })

    it("unlocks after two weeks", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(1209600)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(14000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(14000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(10500)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(3500)
      )
    })

    it("unlocks after four weeks", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(2419200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(28000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(28000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(21000)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(7000)
      )
    })

    it("unlocks after six months", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(14515200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(168000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(168000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(126000)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(42000)
      )
    })

    it("unlocks after a year", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(31536000)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(365000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(365000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(273750)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(91250)
      )
    })
  })

  describe("#Staking", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await add(wallet.address, "75")
      await add(other.address, "25")
      await farmStakingFor(604800)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(5250).add(75)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(1750).add(25)
      )
    })

    it("unlocks after two weeks", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await add(wallet.address, "75")
      await add(other.address, "25")
      await farmStakingFor(1209600)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(14000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(14000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(10500).add(75)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(3500).add(25)
      )
    })

    it("unlocks after four weeks", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await add(wallet.address, "75")
      await add(other.address, "25")
      await farmStakingFor(2419200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(28000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(28000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(21000).add(75)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(7000).add(25)
      )
    })

    it("unlocks after six months", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await add(wallet.address, "75")
      await add(other.address, "25")
      await farmStakingFor(14515200)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(168000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(168000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(126000).add(75)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(42000).add(25)
      )
    })

    it("unlocks after a year", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await add(wallet.address, "75")
      await add(other.address, "25")
      await farmStakingFor(31536000)
      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(365000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(365000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(273750).add(75)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(91250).add(25)
      )
    })
  })

  describe("#EB->Staking->EB", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(604800)

      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await farmStakingFor(604800)

      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        "96044673105003010055904"
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        "72033504828752257541928"
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        "24011168276250752513976"
      )

      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        BigNumber.from("96044673105003010055904").add(expandTo18Decimals(7000))
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        BigNumber.from("72033504828752257541928").add(expandTo18Decimals(5250))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        BigNumber.from("24011168276250752513976").add(expandTo18Decimals(1750))
      )

      await farmEBFor(604800)
      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        BigNumber.from("96044673105003010055904")
          .add(expandTo18Decimals(7000))
          .add(BigNumber.from("87643588270903792615210"))
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        BigNumber.from("72033504828752257541928")
          .add(expandTo18Decimals(5250))
          .add(BigNumber.from("65732691203177844461408"))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        BigNumber.from("24011168276250752513976")
          .add(expandTo18Decimals(1750))
          .add(BigNumber.from("21910897067725948153802"))
      )
    })
  })

  describe("#LP1->Staking->LP2", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(604800)

      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await farmStakingFor(604800)

      await balanceAdder.addFarm(sharesLP2.address, farmLP2.address, 0)
      await addLP(token2.address, wallet.address, "75")
      await addLP(token2.address, other.address, "25")
      await farmLP2For(604800)

      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(7000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(5250)
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(1750)
      )

      await balanceAdder.processBalances(2)
      expect(await farmStaking.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(5250).add(expandTo18Decimals(5250))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(1750).add(expandTo18Decimals(1750))
      )

      await balanceAdder.processBalances(2)
      expect(await farmLP1.totalUnlocked()).to.be.eq(expandTo18Decimals(7000))
      expect(await balanceAdder.totalUnlocked()).to.be.eq(
        expandTo18Decimals(7000)
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        expandTo18Decimals(5250)
          .add(expandTo18Decimals(5250))
          .add(expandTo18Decimals(5250))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        expandTo18Decimals(1750)
          .add(expandTo18Decimals(1750))
          .add(expandTo18Decimals(1750))
      )
    })
  })

  describe("#EB->LP->Staking", () => {
    it("unlocks after one week", async () => {
      await openWallet()
      await openOther()
      await balanceAdder.addFarm(sharesEB.address, farmEB.address, 0)
      await addEB(wallet.address, "75")
      await addEB(other.address, "25")
      await sharesEB.migrate(2)
      await farmEBFor(604800)

      await openToken1()
      await balanceAdder.addFarm(sharesLP1.address, farmLP1.address, 0)
      await addLP(token1.address, wallet.address, "75")
      await addLP(token1.address, other.address, "25")
      await farmLP1For(604800)

      await balanceAdder.addFarm(balanceKeeper.address, farmStaking.address, 0)
      await farmStakingFor(604800)

      await balanceKeeper.setCanAdd(balanceAdder.address, true)
      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        BigNumber.from("96044673105003010055904")
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        BigNumber.from("72033504828752257541928")
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        BigNumber.from("24011168276250752513976")
      )

      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        BigNumber.from("96044673105003010055904").add(expandTo18Decimals(7000))
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        BigNumber.from("72033504828752257541928").add(expandTo18Decimals(5250))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        BigNumber.from("24011168276250752513976").add(expandTo18Decimals(1750))
      )

      await balanceAdder.processBalances(2)
      expect(await balanceKeeper.totalBalance()).to.be.eq(
        BigNumber.from("96044673105003010055904")
          .add(expandTo18Decimals(7000))
          .add(expandTo18Decimals(7000))
      )
      expect(await balanceKeeper["balance(uint256)"](0)).to.be.eq(
        BigNumber.from("72033504828752257541928")
          .add(expandTo18Decimals(5250))
          .add(expandTo18Decimals(5250))
      )
      expect(await balanceKeeper["balance(uint256)"](1)).to.be.eq(
        BigNumber.from("24011168276250752513976")
          .add(expandTo18Decimals(1750))
          .add(expandTo18Decimals(1750))
      )
    })
  })
})
