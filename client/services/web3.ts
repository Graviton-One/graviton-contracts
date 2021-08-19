import { ethers, BigNumber } from 'ethers'

import { IERC20 } from "../../typechain/IERC20"
import { IFarm } from "../../typechain/IFarm"
import { LockGTON } from "../../typechain/LockGTON"
import { LockUnlockLP } from "../../typechain/LockUnlockLP"
import { BalanceKeeperV2 } from "../../typechain/BalanceKeeperV2"
import { VoterV2 } from "../../typechain/VoterV2"
import { LPKeeperV2 } from "../../typechain/LPKeeperV2"
import { LockRouter } from "../../typechain/LockRouter"
import { OracleParserV2 } from "../../typechain/OracleParserV2"
import { IShares } from "../../typechain/IShares"
import { SharesEB } from "../../typechain/SharesEB"
import { BalanceAdderV2 } from '../../typechain/BalanceAdderV2'
import { Faucet } from '../../typechain/Faucet'
import { OTC } from '../../typechain/OTC'

const IERC20ABI          = require('../../abi/IERC20.json');
const LockGTONABI        = require('../../abi/LockGTON.json')
const LockUnlockLPABI    = require('../../abi/LockUnlockLP.json')
const BalanceKeeperV2ABI = require('../../abi/BalanceKeeperV2.json')
const VoterV2ABI         = require('../../abi/VoterV2.json')
const LPKeeperV2ABI      = require('../../abi/LPKeeperV2.json')
const LockRouterABI      = require('../../abi/LockRouter.json')
const OracleParserV2ABI  = require('../../abi/OracleParserV2.json')
const BalanceAdderV2ABI  = require('../../abi/BalanceAdderV2.json')
const IFarmABI           = require('../../abi/IFarm.json')
const ISharesABI         = require('../../abi/IShares.json')
const SharesEBABI        = require('../../abi/SharesEB.json')
const FaucetABI          = require('../../abi/Faucet.json')
const OTCABI             = require('../../abi/OTC.json')

import {FTM, BSC, ETH, PLG, AVA, HEC, DAI} from './constants'

export function formatETHBalance(amount: string): string {
  return ethers.utils.formatUnits(amount, "ether");
}
export function formatAmountToPrecision(
  value: string,
  precision: number
): string {
  let dotAt = value.indexOf(".");
  return dotAt !== -1 ? value.slice(0, ++dotAt + precision) : value;
}
export function formatToken(num: number): number {
  let res = num / Math.pow(10, 18);
  return parseFloat(res.toFixed(4));
}
export function numberWithCommas(x: number): string {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
function unwrap(s?: string): string {
    return s ? s : ''
}

export default class Invoker {

    metamask: ethers.providers.Web3Provider
    signer: ethers.Signer

    constructor(_metamask: ethers.providers.Web3Provider) {
        this.metamask = _metamask
        this.signer = this.metamask.getSigner()
    }

    async balance(chain: string): Promise<string> {
        var provider: ethers.providers.JsonRpcProvider
        if (chain == "FTM") {
            provider = FTM.provider
        } else if (chain == "ETH") {
            provider = ETH.provider
        } else if (chain == "BSC") {
            provider = BSC.provider
        } else if (chain == "PLG") {
            provider = PLG.provider
        } else {
            return "unknown"
        }

        const balance = await provider.getBalance(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }

    async balanceGTON(chain: string): Promise<string> {
        var address: string
        var provider: ethers.providers.JsonRpcProvider
        if (chain == "FTM") {
            address = FTM.gton
            provider = FTM.provider
        } else if (chain == "ETH") {
            address = ETH.gton
            provider = ETH.provider
        } else if (chain == "BSC") {
            address = BSC.gton
            provider = BSC.provider
        } else if (chain == "PLG") {
            address = PLG.gton
            provider = PLG.provider
        } else {
            return "unknown"
        }
        const contract = new ethers.Contract(address, IERC20ABI, provider) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceGTONFTM(): Promise<string> {
        const contract = new ethers.Contract(FTM.gton, IERC20ABI, FTM.provider) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async lockedLP(chain: string): Promise<string> {
        var provider: ethers.providers.JsonRpcProvider
        var lock: string
        var lp: string
        if (chain == "ETH") {
            lock = ETH.lockLP
            lp = ETH.lp
            provider = ETH.provider
        } else if (chain == "BSC") {
            lock = BSC.lockLP
            lp = BSC.lp
            provider = BSC.provider
        } else if (chain == "PLG") {
            lock = PLG.lockLP
            lp = PLG.lp
            provider = PLG.provider
        } else {
            return "unknown"
        }
        const contract = new ethers.Contract(lock, LockUnlockLPABI, provider) as LockUnlockLP
        const balance = await contract.balance(lp, await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceLP(chain: string): Promise<string> {
        var provider: ethers.providers.JsonRpcProvider
        var lp: string
        if (chain == "ETH") {
            lp = ETH.lp
            provider = ETH.provider
        } else if (chain == "BSC") {
            lp = BSC.lp
            provider = BSC.provider
        } else if (chain == "PLG") {
            lp = PLG.lp
            provider = PLG.provider
        } else {
            return "unknown"
        }
        const contract = new ethers.Contract(lp, IERC20ABI, provider) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async lockedLPFTM(chain: string): Promise<string> {
        var lp: string
        if (chain == "ETH") {
            lp = ETH.lp
        } else if (chain == "BSC") {
            lp = BSC.lp
        } else if (chain == "PLG") {
            lp = PLG.lp
        } else {
            return "unknown"
        }
        const contract = new ethers.Contract(FTM.lpKeeper, LPKeeperV2ABI, FTM.provider) as LPKeeperV2
        const balance = await contract['balance(string,bytes,string,bytes)']("EVM", lp, "EVM", await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceGovernance(): Promise<string> {
        const contract = new ethers.Contract(FTM.balanceKeeper, BalanceKeeperV2ABI, FTM.provider) as BalanceKeeperV2
        const balance = await contract['balance(string,bytes)']("EVM", await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async userAddress(): Promise<string> {
        return await this.signer.getAddress()
    }
    async userId(): Promise<string> {
        const contract = new ethers.Contract(FTM.balanceKeeper, BalanceKeeperV2ABI, FTM.provider) as BalanceKeeperV2
        try {
            const id = await contract.userIdByChainAddress("EVM", await this.signer.getAddress())
            return id.toString()
        } catch {
            return "no id"
        }
    }
    async processedUsers(): Promise<string> {
        const contract = new ethers.Contract(FTM.balanceAdder, BalanceAdderV2ABI, FTM.provider) as BalanceAdderV2
        const processedUsers = await contract.currentUser()
        return processedUsers.toString()
    }
    async totalFarms(): Promise<string> {
        const contract = new ethers.Contract(FTM.balanceAdder, BalanceAdderV2ABI, FTM.provider) as BalanceAdderV2
        const totalFarms = await contract.totalFarms()
        return totalFarms.toString()
    }
    async currentFarm(): Promise<string> {
        const contract = new ethers.Contract(FTM.balanceAdder, BalanceAdderV2ABI, FTM.provider) as BalanceAdderV2
        const currentFarm = await contract.currentFarm()
        return currentFarm.toString()
    }
    async totalUnlockedEB(): Promise<string> {
        const contract = new ethers.Contract(FTM.farmEB, IFarmABI, FTM.provider) as IFarm
        const totalUnlocked = await contract.totalUnlocked()
        return formatETHBalance(totalUnlocked.toString())
    }
    async percentEB(): Promise<string> {
        const keeper = new ethers.Contract(FTM.balanceKeeper, BalanceKeeperV2ABI, FTM.provider) as BalanceKeeperV2
        try {
            const id = await keeper.userIdByChainAddress("EVM", await this.signer.getAddress())
            const shares = new ethers.Contract(FTM.sharesEB, SharesEBABI, FTM.provider) as SharesEB
            const share = await shares.shareById(id.toNumber())
            const totalShares = await shares.totalShares()
            const percent = share.mul(BigNumber.from(100)).div(totalShares)
            return percent.toString()
        } catch {
            return "no id"
        }

    }
    async totalEBshares(): Promise<string> {
        const contract = new ethers.Contract(FTM.sharesEB, SharesEBABI, FTM.provider) as SharesEB
        const totalShares = await contract.totalShares()
        return totalShares.toString()
    }
    async percentStaking(): Promise<string> {
        const keeper = new ethers.Contract(FTM.balanceKeeper, BalanceKeeperV2ABI, FTM.provider) as BalanceKeeperV2
        const share = await keeper['balance(string,bytes)']("EVM", await this.signer.getAddress())
        const totalShares = await keeper.totalBalance()
        const percent = share.mul(BigNumber.from(100)).div(totalShares)
        return percent.toString()
    }
    async totalUnlockedStaking(): Promise<string> {
        const contract = new ethers.Contract(FTM.farmStaking, IFarmABI, FTM.provider) as IFarm
        const totalUnlocked = await contract.totalUnlocked()
        return formatETHBalance(totalUnlocked.toString())
    }
    async claimAllowance(): Promise<string> {
        const contract = new ethers.Contract(FTM.gton, IERC20ABI, FTM.provider) as IERC20
        const allowance = await contract.allowance(FTM.claimWallet, FTM.claim)
        console.log(allowance)
        const balance = await contract.balanceOf(FTM.claimWallet)
        console.log(balance)
        if (allowance.lt(balance)) {
            return formatETHBalance(allowance.toString())
        } else {
            return formatETHBalance(balance.toString())
        }
    }
    async totalLPTokens(): Promise<string> {
        const contract = new ethers.Contract(FTM.lpKeeper, LPKeeperV2ABI, FTM.provider) as LPKeeperV2
        const totalLPTokens = await contract.totalTokens()
        return totalLPTokens.toString()
    }
    async votingRounds(): Promise<string> {
        const contract = new ethers.Contract(FTM.voter, VoterV2ABI, FTM.provider) as VoterV2
        const votingRounds = await contract.totalActiveRounds()
        return votingRounds.toString()
    }
    async votes(roundId: string, optionId: string, userId: string): Promise<string> {
        try {
            const contract = new ethers.Contract(FTM.voter, VoterV2ABI, FTM.provider) as VoterV2
            const votes = await contract.votesForOptionByUser(roundId, optionId, userId)
            return votes.toString()
        } catch {
            return ""
        }
    }
    async voteOption(roundId: string, optionId: string): Promise<string> {
        try {
            const contract = new ethers.Contract(FTM.voter, VoterV2ABI, FTM.provider) as VoterV2
            const name = await contract.optionName(roundId, optionId)
            return name
        } catch {
            return ""
        }
    }

    async approveGTON(chain: string, amount: number) {
        var gton: string
        var lock: string
        if (chain == "ETH") {
            gton = ETH.gton
            lock = ETH.lockGTON
        } else if (chain == "BSC") {
            gton = BSC.gton
            lock = BSC.lockGTON
        } else if (chain == "PLG") {
            gton = PLG.gton
            lock = PLG.lockGTON
        } else {
            return
        }
        const contract = new ethers.Contract(gton, IERC20ABI, this.signer) as IERC20
        await contract.approve(lock, amount)
    }
    async lockGTON(chain: string, amount: number) {
        var address: string
        if (chain == "ETH") {
            address = ETH.lockGTON
        } else if (chain == "BSC") {
            address = BSC.lockGTON
        } else if (chain == "PLG") {
            address = PLG.lockGTON
        } else {
            return
        }
        const port = new ethers.Contract(address, LockGTONABI, this.signer) as LockGTON
        await port.lock(amount)
    }
    async approveLP(chain: string, lptoken: string, amount: string) {
        var lock: string
        var lp: string
        if (chain == "ETH") {
            lock = ETH.lockLP
            lp = ETH.lp
        } else if (chain == "BSC") {
            lock = BSC.lockLP
            lp = BSC.lp
        } else if (chain == "PLG") {
            lock = PLG.lockLP
            lp = PLG.lp
        } else {
            return
        }
        const token = new ethers.Contract(lp, IERC20ABI, this.signer) as IERC20
        await token.approve(lock, amount)
    }
    async lockLP(chain: string, lptoken: string, amount: string) {
        var lock: string
        var lp: string
        if (chain == "ETH") {
            lock = ETH.lockLP
            lp = ETH.lp
        } else if (chain == "BSC") {
            lock = BSC.lockLP
            lp = BSC.lp
        } else if (chain == "PLG") {
            lock = PLG.lockLP
            lp = PLG.lp
        } else {
            return
        }
        const port = new ethers.Contract(lock, LockUnlockLPABI, this.signer) as LockUnlockLP
        await port.lock(lp, amount)
    }
    async unlockLP(chain: string, lptoken: string, amount: string) {
        var lock: string
        var lp: string
        if (chain == "ETH") {
            lock = ETH.lockLP
            lp = ETH.lp
        } else if (chain == "BSC") {
            lock = BSC.lockLP
            lp = BSC.lp
        } else if (chain == "PLG") {
            lock = PLG.lockLP
            lp = PLG.lp
        } else {
            return
        }
        const port = new ethers.Contract(lock, LockUnlockLPABI, this.signer) as LockUnlockLP
        await port.unlock(lp, amount)
    }
    async processBalances() {
        const contract = new ethers.Contract(FTM.balanceAdder, BalanceAdderV2ABI, this.signer) as BalanceAdderV2
        await contract.processBalances(50)
    }
    async unlockAssetEB() {
        const contract = new ethers.Contract(FTM.farmEB, IFarmABI, this.signer) as IFarm
        await contract.unlockAsset()
    }
    async unlockAssetStaking() {
        const contract = new ethers.Contract(FTM.farmStaking, IFarmABI, this.signer) as IFarm
        await contract.unlockAsset()
    }
    // async claim(amount: string) {
    //     const contract = new ethers.Contract(FTM.claim, ClaimGTONV2ABI, this.signer) as ClaimGTONV2
    //     await contract.claim(amount)
    // }
    async castVotes(roundId: string, votes1: string, votes2: string) {
        const contract = new ethers.Contract(FTM.voter, VoterV2ABI, this.signer) as VoterV2
        await contract['castVotes(uint256,uint256[])'](roundId, [votes1, votes2])
    }
    async faucet(chain: string) {
        var gton: string
        var faucet: string
        if (chain == "ETH") {
            gton = ETH.gton
            faucet = ETH.faucet
        } else if (chain == "BSC") {
            gton = BSC.gton
            faucet = BSC.faucet
        } else if (chain == "PLG") {
            gton = PLG.gton
            faucet = PLG.faucet
        } else {
            return
        }
        const contract = new ethers.Contract(faucet, FaucetABI, this.signer) as Faucet
        await contract.drop(gton)
    }

    async balanceNT(provider: ethers.providers.JsonRpcProvider, address: string): Promise<BigNumber> {
        return await provider.getBalance(address)
    }
    async balanceOf(provider: ethers.providers.JsonRpcProvider, token: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(token, IERC20ABI, provider) as IERC20
        return await contract.balanceOf(address)
    }
    async allowance(provider: ethers.providers.JsonRpcProvider, token: string, owner: string, spender: string): Promise<BigNumber> {
        const contract = new ethers.Contract(token, IERC20ABI, provider) as IERC20
        return await contract.allowance(owner, spender)
    }

    async price(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.price()
    }
    async setPriceLast(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.setPriceLast()
    }
    async cliffAdmin(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.cliffAdmin()
    }
    async vestingTimeAdmin(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.vestingTimeAdmin()
    }
    async numberOfTranchesAdmin(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.numberOfTranchesAdmin()
    }
    async setVestingParamsLast(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.setVestingParamsLast()
    }
    async upperLimit(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.upperLimit()
    }
    async lowerLimit(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.lowerLimit()
    }
    async setLimitsLast(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.setLimitsLast()
    }
    async cliff(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.cliff(address)
    }
    async vestingTime(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.vestingTime(address)
    }
    async numberOfTranches(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.numberOfTranches(address)
    }
    async startTime(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.startTime(address)
    }
    async vested(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.vested(address)
    }
    async claimed(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.claimed(address)
    }
    async claimLast(otc: string, address: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.claimLast(address)
    }
    async balanceGTONotc(gton: string, otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(gton, IERC20ABI, this.signer) as IERC20
        return await contract.balanceOf(otc)
    }
    async vestedTotal(otc: string): Promise<BigNumber> {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        return await contract.vestedTotal()
    }
    async approve(token: string, otc: string, amount: string) {
        console.log("approve", token, otc, amount)
        const contract = new ethers.Contract(token, IERC20ABI, this.signer) as IERC20
        await contract.approve(otc, amount)
    }
    async exchange(otc: string, amount: string) {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        await contract.exchange(amount)
    }
    async claim(otc: string) {
        const contract = new ethers.Contract(otc, OTCABI, this.signer) as OTC
        await contract.claim()
    }
}
