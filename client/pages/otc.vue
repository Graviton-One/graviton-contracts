<template>
  <div class="container">
    <div>
      <div>
          <div> Current network: {{ chain }}</div>
          <div>      OTC address: {{ otc }}</div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>
        <table class="table">
            <thead>
                <tr>
                    <td>gton on otc</td>
                    <td>already sold on otc</td>
                    <td>available for otc</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ formatUnits(balanceGTON, 18) }}</td>
                    <td>{{ formatUnits(vestedTotal, 18) }}</td>
                    <td>{{ formatUnits(freeGTON, 18) }} ({{ freeGTON }})</td>
                </tr>
            </tbody>
        </table>
        <table class="table">
            <thead>
                <tr>
                    <td>price</td>
                    <td>cliff</td>
                    <td>vesting time</td>
                    <td>number of tranches</td>
                    <td>lower limit</td>
                    <td>upper limit</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ formatUnits(price, 2) }}</td>
                    <td>{{ formatDuration(cliffAdmin) }}</td>
                    <td>{{ formatDuration(vestingTimeAdmin) }}</td>
                    <td>{{ numberOfTranchesAdmin }}</td>
                    <td>{{ formatUnits(lowerLimit, 18) }}</td>
                    <td>{{ formatUnits(upperLimit, 18) }}</td>
                </tr>
            </tbody>
        </table>
        <!-- <table class="table table-hover">
             <thead>
             <tr>
             <td>price last set (once in 24 hours)</td>
             <td>params last set (once in 24 hours)</td>
             <td>limits last set (once in 24 hours)</td>
             </tr>
             </thead>
             <tbody>
             <tr>
             <td>{{ setPriceLast == 0 ? "" : formatTimestamp(setPriceLast) }}</td>
             <td>{{ setVestingParamsLast == 0 ? "" : formatTimestamp(setVestingParamsLast) }}</td>
             <td>{{ setLimitsLast == 0 ? "" : formatTimestamp(setLimitsLast) }}</td>
             </tr>
             </tbody>
             </table> -->
        <br>
        <div> Amount: <input v-model="exchangeAmount" placeholder="amount">
            <Button class='button--green' size="large" ghost @click="exchange">Buy</Button></div>
        <br>
        <div> Address: <input v-model="address" placeholder="address">
            <Button class='button--green' size="large" ghost @click="info">Info</Button></div>
        <table class="table">
            <thead>
                <tr>
                    <td>vested</td>
                    <td>start time</td>
                    <td>cliff</td>
                    <td>vesting time</td>
                    <td>number of tranches</td>
                    <td>claimed</td>
                    <td>claimable</td>
                    <td>last claim</td>
                    <td>next claim</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{{ formatUnits(vested, 18) }} GTON</td>
                    <td>{{ startTime == 0 ? "" : formatTimestamp(startTime) }}</td>
                    <td>{{ formatDuration(cliff) }}</td>
                    <td>{{ formatDuration(vestingTime) }}</td>
                    <td>{{ numberOfTranches }}</td>
                    <td>{{ formatUnits(claimed, 18) }} GTON</td>
                    <td>{{ formatUnits(claimable, 18) }} ({{ claimable }})</td>
                    <td>{{ claimLast == 0 ? "" : formatTimestamp(claimLast) }}</td>
                    <td>{{ claimNext == 0 ? "" : claimNext == 1 ? "can claim now" : formatTimestamp(claimNext) }}</td>
                </tr>
            </tbody>
        </table>
        <Button class='button--green' size="large" ghost @click="claim">Claim</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ethers, BigNumber } from 'ethers'
import Invoker from '../services/web3.ts'
import { BSC, PLG, ETH, FTM, DAI, HEC, AVA } from '../services/constants.ts'

 export default Vue.extend({
     data () {
         return {
             invoker: {},
             price: BigNumber.from(0),
             setPriceLast: BigNumber.from(0),
             cliffAdmin: BigNumber.from(0),
             vestingTimeAdmin: BigNumber.from(0),
             numberOfTranchesAdmin: BigNumber.from(0),
             setVestingParamsLast: BigNumber.from(0),
             upperLimit: BigNumber.from(0),
             lowerLimit: BigNumber.from(0),
             setLimitsLast: BigNumber.from(0),
             cliff: BigNumber.from(0),
             vestingTime: BigNumber.from(0),
             numberOfTranches: BigNumber.from(0),
             startTime: BigNumber.from(0),
             vested: BigNumber.from(0),
             claimed: BigNumber.from(0),
             claimLast: BigNumber.from(0),
             claimNext: BigNumber.from(0),
             claimable: BigNumber.from(0),
             exchangeAmount: "",
             address: "",
             otc: "",
             token: "",
             chain: "",
             freeGTON: BigNumber.from(0),
             balanceGTON: BigNumber.from(0),
             vestedTotal: BigNumber.from(0)
         }
     },
     async mounted () {
         await this.connect()
     },
     methods: {
         async connect () {
             await window.ethereum.enable()
             const provider = new ethers.providers.Web3Provider(window.ethereum)
             this.invoker = new Invoker(provider)
             console.log("Invoker loaded:", this.invoker)
             this.address = await (await provider.getSigner()).getAddress()
             let network = await provider.getNetwork()
             switch (network.chainId) {
                 case 56:
                     this.otc = BSC.otc
                     this.token = BSC.busd
                     this.gton = BSC.gton
                     this.chain = "binance"
                     break
                 case 1:
                     this.otc = ETH.otc
                     this.token = ETH.usdc
                     this.gton = ETH.gton
                     this.chain = "ethereum"
                     break
                 case 100:
                     this.otc = DAI.otc
                     this.token = DAI.usdc
                     this.gton = DAI.gton
                     this.chain = "xdai"
                     break
                 case 128:
                     this.otc = HEC.otc
                     this.token = HEC.usdc
                     this.gton = HEC.gton
                     this.chain = "heco"
                     break
                 case 137:
                     this.otc = PLG.otc
                     this.token = PLG.usdc
                     this.gton = PLG.gton
                     this.chain = "polygon"
                     break
                 case 250:
                     this.otc = FTM.otc
                     this.token = FTM.usdc
                     this.gton = FTM.gton
                     this.chain = "fantom"
                     break
                 default:
                     console.log("default")
                     this.chain = "unknown"
             }
             console.log("OTC contract: ", this.otc)
         },
         async update () {
             this.price = BigNumber.from(0)
             this.setPriceLast = BigNumber.from(0)
             this.cliffAdmin = BigNumber.from(0)
             this.vestingTimeAdmin = BigNumber.from(0)
             this.numberOfTranchesAdmin = BigNumber.from(0)
             this.setVestingParamsLast = BigNumber.from(0)
             this.upperLimit = BigNumber.from(0)
             this.lowerLimit = BigNumber.from(0)
             this.setLimitsLast = BigNumber.from(0)
             this.freeGTON = BigNumber.from(0)
             this.balanceGTON = BigNumber.from(0)
             this.vestedTotal = BigNumber.from(0)

             try {
                 this.price = await this.invoker.price(this.otc)
                 this.setPriceLast = await this.invoker.setPriceLast(this.otc)
                 this.cliffAdmin = await this.invoker.cliffAdmin(this.otc)
                 this.vestingTimeAdmin = await this.invoker.vestingTimeAdmin(this.otc)
                 this.numberOfTranchesAdmin = await this.invoker.numberOfTranchesAdmin(this.otc)
                 this.setVestingParamsLast = await this.invoker.setVestingParamsLast(this.otc)
                 this.upperLimit = await this.invoker.upperLimit(this.otc)
                 this.lowerLimit = await this.invoker.lowerLimit(this.otc)
                 this.setLimitsLast = await this.invoker.setLimitsLast(this.otc)
                 this.balanceGTON = await this.invoker.balanceGTONotc(this.gton, this.otc)
                 this.vestedTotal = await this.invoker.vestedTotal(this.otc)
                 this.freeGTON = this.balanceGTON.sub(this.vestedTotal)
             } catch(e) { console.log(e) }
         },
         async info () {
             this.cliff = BigNumber.from(0)
             this.vestingTime = BigNumber.from(0)
             this.numberOfTranches = BigNumber.from(0)
             this.startTime = BigNumber.from(0)
             this.vested = BigNumber.from(0)
             this.claimed = BigNumber.from(0)
             this.claimLast = BigNumber.from(0)
             this.claimNext = BigNumber.from(0)
             this.claimable = BigNumber.from(0)

             try {
                 this.cliff = await this.invoker.cliff(this.otc, this.address)
                 this.vestingTime = await this.invoker.vestingTime(this.otc, this.address)
                 this.numberOfTranches = await this.invoker.numberOfTranches(this.otc, this.address)
                 this.startTime = await this.invoker.startTime(this.otc, this.address)
                 this.vested = await this.invoker.vested(this.otc, this.address)
                 this.claimed = await this.invoker.claimed(this.otc, this.address)
                 this.claimLast = await this.invoker.claimLast(this.otc, this.address)
                 let blockstamp = BigNumber.from((await this.invoker.metamask.getBlock()).timestamp)
                 if (blockstamp.sub(this.startTime).lt(this.cliff)) {
                     this.claimNext = this.startTime.add(this.cliff)
                     return
                 }
                 let interval = this.vestingTime.div(this.numberOfTranches)
                 let intervals = blockstamp.sub(this.startTime).div(interval).add(BigNumber.from(1))
                 let accrued = intervals.lt(this.numberOfTranches) ? intervals : this.numberOfTranches
                 this.claimable = this.vested.mul(accrued).div(this.numberOfTranches).sub(this.claimed)
                 if (blockstamp.sub(this.claimLast).lt(interval)) {
                     this.claimNext = this.claimLast.add(interval)
                 } else {
                     this.claimNext = BigNumber.from(1)
                 }
             } catch(e) { console.log(e) }
         },
         async exchange () {
             try {
                 let price = await this.invoker.price(this.otc)
                 let baseAmount = BigNumber.from(this.exchangeAmount)
                 let big12 = BigNumber.from("1000000000000")
                 let quoteAmount = price.mul(baseAmount).div(100).div(big12)
                 if (quoteAmount.lte(BigNumber.from(0))) { throw "amount too little" }
                 await this.invoker.approve(this.token, this.otc, quoteAmount)
                 await this.invoker.exchange(this.otc, this.exchangeAmount)
             } catch(e) { console.log(e) }
         },
         async claim () {
             try {
                 await this.invoker.claim(this.otc)
             } catch(e) { console.log(e) }
         },
         formatUnits(amount: BigNumber, precision: number): string {
             return ethers.utils.formatUnits(amount, precision);
         },
         formatTimestamp(stamp: BigNumber): string {
             let d = new Date(stamp.toNumber() * 1000)
             return d.toLocaleString()
         },
         formatDuration(stamp: BigNumber): string {
             const sec = stamp.mod(BigNumber.from(60))
             const mins = stamp.div(BigNumber.from(60))
             const min = mins.mod(BigNumber.from(60))
             const hours = mins.div(BigNumber.from(60))
             const h = hours.mod(BigNumber.from(24))
             const days = hours.div(BigNumber.from(24))
             // return `${min}min${sec > 0 ? ` ${sec}s` : ''}`
             return `${days}d ${h}h ${min}m`
             // stamp.div(BigNumber.from(60)1)
             // return stamp.toString()
         }
     }
 })
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
