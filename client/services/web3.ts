import { ethers, BigNumber } from 'ethers'

import { IERC20 } from "../../typechain/IERC20"
import { IFarm } from "../../typechain/IFarm"
import { LockGTON } from "../../typechain/LockGTON"
import { LockUnlockLP } from "../../typechain/LockUnlockLP"
import { BalanceKeeperV2 } from "../../typechain/BalanceKeeperV2"
import { VoterV2 } from "../../typechain/VoterV2"
import { LPKeeperV2 } from "../../typechain/LPKeeperV2"
import { OracleRouterV2 } from "../../typechain/OracleRouterV2"
import { OracleParserV2 } from "../../typechain/OracleParserV2"
import { ClaimGTONV2 } from "../../typechain/ClaimGTONV2"
import { IShares } from "../../typechain/IShares"
import { SharesEB } from "../../typechain/SharesEB"
import { BalanceAdderV2 } from '../../typechain/BalanceAdderV2'
import { Faucet } from '../../typechain/Faucet'

const IERC20ABI          = require('../../abi/IERC20.json');
const LockGTONABI        = require('../../abi/LockGTON.json')
const LockUnlockLPABI    = require('../../abi/LockUnlockLP.json')
const BalanceKeeperV2ABI = require('../../abi/BalanceKeeperV2.json')
const VoterV2ABI         = require('../../abi/VoterV2.json')
const LPKeeperV2ABI      = require('../../abi/LPKeeperV2.json')
const OracleRouterV2ABI  = require('../../abi/OracleRouterV2.json')
const OracleParserV2ABI  = require('../../abi/OracleParserV2.json')
const BalanceAdderV2ABI  = require('../../abi/BalanceAdderV2.json')
const IFarmABI           = require('../../abi/IFarm.json')
const ISharesABI         = require('../../abi/IShares.json')
const SharesEBABI        = require('../../abi/SharesEB.json')
const ClaimGTONV2ABI     = require('../../abi/ClaimGTONV2.json')
const FaucetABI          = require('../../abi/Faucet.json')

import {
    GTONBinanceAddress,
    GTONFantomAddress,
    LockGTONAddress,
    LockUnlockLPAddress,
    BalanceKeeperV2Address,
    VoterV2Address,
    LPKeeperV2Address,
    OracleRouterV2Address,
    OracleParserV2Address,
    BalanceAdderV2Address,
    FarmEBAddress,
    SharesEBAddress,
    FarmStakingAddress,
    ClaimGTONV2Address,
    ClaimWalletAddress,
    FaucetAddress,
    testLPBinance
} from './constants'

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

export default class Invoker {

    fantom: ethers.providers.JsonRpcProvider
    binance: ethers.providers.JsonRpcProvider
    metamask: ethers.providers.Web3Provider
    signer: ethers.Signer

    constructor(_metamask: ethers.providers.Web3Provider) {
        this.metamask = _metamask
        this.signer = this.metamask.getSigner()
        this.fantom = new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network")
        this.binance = new ethers.providers.JsonRpcProvider("https://bsc-dataseed1.binance.org")
    }

    async balanceGTONBSC(): Promise<string> {
        const contract = new ethers.Contract(GTONBinanceAddress, IERC20ABI, this.binance) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceGTONFTM(): Promise<string> {
        const contract = new ethers.Contract(GTONFantomAddress, IERC20ABI, this.fantom) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async lockedLPBSC(lptoken: string): Promise<string> {
        const contract = new ethers.Contract(LockUnlockLPAddress, LockUnlockLPABI, this.binance) as LockUnlockLP
        const balance = await contract.balance(testLPBinance, await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceLPBSC(): Promise<string> {
        const contract = new ethers.Contract(testLPBinance, IERC20ABI, this.binance) as IERC20
        const balance = await contract.balanceOf(await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async lockedLPFTM(tokenId: number): Promise<string> {
        const contract = new ethers.Contract(LPKeeperV2Address, LPKeeperV2ABI, this.fantom) as LPKeeperV2
        const balance = await contract['balance(uint256,string,bytes)'](tokenId, "EVM", await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async balanceGovernance(): Promise<string> {
        const contract = new ethers.Contract(BalanceKeeperV2Address, BalanceKeeperV2ABI, this.fantom) as BalanceKeeperV2
        const balance = await contract['balance(string,bytes)']("EVM", await this.signer.getAddress())
        return formatETHBalance(balance.toString())
    }
    async userAddress(): Promise<string> {
        return await this.signer.getAddress()
    }
    async userId(): Promise<string> {
        const contract = new ethers.Contract(BalanceKeeperV2Address, BalanceKeeperV2ABI, this.fantom) as BalanceKeeperV2
        try {
            const id = await contract.userIdByChainAddress("EVM", await this.signer.getAddress())
            return id.toString()
        } catch {
            return "no id"
        }
    }
    async processedUsers(): Promise<string> {
        const contract = new ethers.Contract(BalanceAdderV2Address, BalanceAdderV2ABI, this.fantom) as BalanceAdderV2
        const processedUsers = await contract.currentUser()
        return processedUsers.toString()
    }
    async totalFarms(): Promise<string> {
        const contract = new ethers.Contract(BalanceAdderV2Address, BalanceAdderV2ABI, this.fantom) as BalanceAdderV2
        const totalFarms = await contract.totalFarms()
        return totalFarms.toString()
    }
    async currentFarm(): Promise<string> {
        const contract = new ethers.Contract(BalanceAdderV2Address, BalanceAdderV2ABI, this.fantom) as BalanceAdderV2
        const currentFarm = await contract.currentFarm()
        return currentFarm.toString()
    }
    async totalUnlockedEB(): Promise<string> {
        const contract = new ethers.Contract(FarmEBAddress, IFarmABI, this.fantom) as IFarm
        const totalUnlocked = await contract.totalUnlocked()
        return formatETHBalance(totalUnlocked.toString())
    }
    async percentEB(): Promise<string> {
        const keeper = new ethers.Contract(BalanceKeeperV2Address, BalanceKeeperV2ABI, this.fantom) as BalanceKeeperV2
        try {
            const id = await keeper.userIdByChainAddress("EVM", await this.signer.getAddress())
            const shares = new ethers.Contract(SharesEBAddress, SharesEBABI, this.fantom) as SharesEB
            const share = await shares.shareById(id.toNumber())
            const totalShares = await shares.totalShares()
            const percent = share.mul(BigNumber.from(100)).div(totalShares)
            return percent.toString()
        } catch {
            return "no id"
        }

    }
    async totalEBshares(): Promise<string> {
        const contract = new ethers.Contract(SharesEBAddress, SharesEBABI, this.fantom) as SharesEB
        const totalShares = await contract.totalShares()
        return totalShares.toString()
    }
    async percentStaking(): Promise<string> {
        const keeper = new ethers.Contract(BalanceKeeperV2Address, BalanceKeeperV2ABI, this.fantom) as BalanceKeeperV2
        const share = await keeper['balance(string,bytes)']("EVM", await this.signer.getAddress())
        const totalShares = await keeper.totalBalance()
        const percent = share.mul(BigNumber.from(100)).div(totalShares)
        return percent.toString()
    }
    async totalUnlockedStaking(): Promise<string> {
        const contract = new ethers.Contract(FarmStakingAddress, IFarmABI, this.fantom) as IFarm
        const totalUnlocked = await contract.totalUnlocked()
        return formatETHBalance(totalUnlocked.toString())
    }
    async claimAllowance(): Promise<string> {
        const contract = new ethers.Contract(GTONFantomAddress, IERC20ABI, this.fantom) as IERC20
        const allowance = await contract.allowance(ClaimWalletAddress, ClaimGTONV2Address)
        return formatETHBalance(allowance.toString())
    }
    async totalLPTokens(): Promise<string> {
        const contract = new ethers.Contract(LPKeeperV2Address, LPKeeperV2ABI, this.fantom) as LPKeeperV2
        const totalLPTokens = await contract.totalTokens()
        return totalLPTokens.toString()
    }
    async votingRounds(): Promise<string> {
        const contract = new ethers.Contract(VoterV2Address, VoterV2ABI, this.fantom) as VoterV2
        const votingRounds = await contract.totalActiveRounds()
        return votingRounds.toString()
    }
    async votes(roundId: string, optionId: string, userId: string): Promise<string> {
        try {
            const contract = new ethers.Contract(VoterV2Address, VoterV2ABI, this.fantom) as VoterV2
            const votes = await contract.votesForOptionByUser(roundId, optionId, userId)
            return votes.toString()
        } catch {
            return ""
        }
    }
    async voteOption(roundId: string, optionId: string): Promise<string> {
        try {
            const contract = new ethers.Contract(VoterV2Address, VoterV2ABI, this.fantom) as VoterV2
            const name = await contract.optionName(roundId, optionId)
            return name
        } catch {
            return ""
        }
    }

    async approveGTON(amount: number) {
        const contract = new ethers.Contract(GTONBinanceAddress, IERC20ABI, this.signer) as IERC20
        await contract.approve(LockGTONAddress, amount)
    }
    async lockGTON(amount: number) {
        const port = new ethers.Contract(LockGTONAddress, LockGTONABI, this.signer) as LockGTON
        await port.lock(await this.signer.getAddress(), amount)
    }
    async approveLP(lptoken: string, amount: string) {
        const token = new ethers.Contract(testLPBinance, IERC20ABI, this.signer) as IERC20
        await token.approve(LockUnlockLPAddress, amount)
    }
    async lockLP(lptoken: string, amount: string) {
        const port = new ethers.Contract(LockUnlockLPAddress, LockUnlockLPABI, this.signer) as LockUnlockLP
        await port.lock(testLPBinance, await this.signer.getAddress(), amount)
    }
    async unlockLP(lptoken: string, amount: string) {
        const port = new ethers.Contract(LockUnlockLPAddress, LockUnlockLPABI, this.signer) as LockUnlockLP
        await port.unlock(testLPBinance, await this.signer.getAddress(), amount)
    }
    async processBalances() {
        const contract = new ethers.Contract(BalanceAdderV2Address, BalanceAdderV2ABI, this.signer) as BalanceAdderV2
        await contract.processBalances(50)
    }
    async unlockAssetEB() {
        const contract = new ethers.Contract(FarmEBAddress, IFarmABI, this.signer) as IFarm
        await contract.unlockAsset()
    }
    async unlockAssetStaking() {
        const contract = new ethers.Contract(FarmStakingAddress, IFarmABI, this.signer) as IFarm
        await contract.unlockAsset()
    }
    async claim(amount: string) {
        const contract = new ethers.Contract(ClaimGTONV2Address, ClaimGTONV2ABI, this.signer) as ClaimGTONV2
        await contract.claim(await this.signer.getAddress(), amount)
    }
    async castVotes(roundId: string, votes1: string, votes2: string) {
        const contract = new ethers.Contract(VoterV2Address, VoterV2ABI, this.signer) as VoterV2
        await contract['castVotes(uint256,uint256[])'](roundId, [votes1, votes2])
    }
    async faucet() {
        const contract = new ethers.Contract(FaucetAddress, FaucetABI, this.signer) as Faucet
        await contract.drop(GTONBinanceAddress)
    }
}
