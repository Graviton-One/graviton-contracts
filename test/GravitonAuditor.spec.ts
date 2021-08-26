import { ethers, waffle } from "hardhat"
import { GravitonAuditor } from "../typechain/GravitonAuditor"
import { expect } from "./shared/expect"

const createFixtureLoader = waffle.createFixtureLoader

describe("FarmCurved", () => {
  const [wallet, other] = waffle.provider.getWallets()

  let auditor: GravitonAuditor

  const fixture = async () => {
    const auditorFactory = await ethers.getContractFactory("GravitonAuditor")
    return (await auditorFactory.deploy(
        wallet.address
    )) as GravitonAuditor
  }

  let loadFixture: ReturnType<typeof createFixtureLoader>

  before("create fixture loader", async () => {
    loadFixture = createFixtureLoader([wallet, other])
  })

  beforeEach("deploy auditor", async () => {
    auditor = await loadFixture(fixture)
  })

  it("constructor initializes variables", async () => {
    expect(await auditor.owner()).to.eq(wallet.address)
  })

  it("returns correct value", async () => {
      let uuid = "0x7e9a211829334e9790ffd999642f0c9d"
      let source_chain = "DAI"
      let destination_chain = "FTM"
      let sender = "0xced486e3905f8fe1e8af5d1791f5e7ad7915f01a"
      let receiver = "0xced486e3905f8fe1e8af5d1791f5e7ad7915f01a"
      let amount = 319715062527782
      let destination_tx = "0x9ba2559c315bd84b079329c07ff0a5eb255d4466243a12a423a64e87069b6cf5"
      let source_tx = "0x54ba38376e189bb4d525ed027370172e2e3b55108fdfb5130567d5149ba710a7"

      await auditor.addSwap(uuid, sender, source_chain, receiver, destination_chain, amount, source_tx, destination_tx)

      await auditor.checkSwap(uuid, sender, source_chain, receiver, destination_chain, amount)
  })
})
