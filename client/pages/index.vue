<template>
  <div class="container">
    <div>
      <div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>
        <div> User Address: {{ userAddress }}</div>
        <div> User Id: {{ userId }}</div>
        <br>
        <div> GTON balance fantom: {{ balanceGTONFTM }}</div>
        <div> Governance balance: {{ balanceGovernance }}</div>
        <br>
        <br>
        <div> binance GTON balance: {{ balanceGTONBSC }}</div>
        <div> binance LP balance: {{ balanceLPBSC }}</div>
        <div> binance LP locked: {{ lockedLPBSC }}</div>
        <div> binance LP counted on FTM: {{ lockedLPFTMBSC }}</div>
        <input v-model="lockGTONBSCAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveGTON('BSC')">Approve GTON</Button>
        <Button class='button--green' size="large" ghost @click="lockGTON('BSC')">Lock GTON</Button>
        <br>
        <input v-model="lockLPBSCAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveLP('BSC')">Approve LP</Button>
        <Button class='button--green' size="large" ghost @click="lockLP('BSC')">Lock LP</Button>
        <br>
        <input v-model="unlockLPBSCAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="unlockLP('BSC')">Unlock LP</Button>
        <br>
        <br>
        <div> ethereum GTON balance: {{ balanceGTONETH }}</div>
        <div> ethereum LP balance: {{ balanceLPETH }}</div>
        <div> ethereum LP locked: {{ lockedLPETH }}</div>
        <div> ethereum LP counted on FTM: {{ lockedLPFTMETH }}</div>
        <br>
        <input v-model="lockGTONETHAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveGTON('ETH')">Approve GTON</Button>
        <Button class='button--green' size="large" ghost @click="lockGTON('ETH')">Lock GTON</Button>
        <br>
        <input v-model="lockLPETHAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveLP('ETH')">Approve LP</Button>
        <Button class='button--green' size="large" ghost @click="lockLP('ETH')">Lock LP</Button>
        <br>
        <input v-model="unlockLPETHAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="unlockLP('ETH')">Unlock LP</Button>
        <br>
        <br>
        <div> polygon GTON balance: {{ balanceGTONPLG }}</div>
        <div> polygon LP balance: {{ balanceLPPLG }}</div>
        <div> polygon LP locked: {{ lockedLPPLG }}</div>
        <div> polygon LP counted on FTM: {{ lockedLPFTMPLG }}</div>
        <br>
        <input v-model="lockGTONPLGAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveGTON('PLG')">Approve GTON</Button>
        <Button class='button--green' size="large" ghost @click="lockGTON('PLG')">Lock GTON</Button>
        <br>
        <input v-model="lockLPPLGAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveLP('PLG')">Approve LP</Button>
        <Button class='button--green' size="large" ghost @click="lockLP('PLG')">Lock LP</Button>
        <br>
        <input v-model="unlockLPPLGAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="unlockLP('PLG')">Unlock LP</Button>
        <br>
        <br>
        <div> Total GTON for claiming: {{ claimAllowance }}</div>
        <br>
        <input v-model="claimAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="claim">Claim</Button>
        <br>
        <br>
        <div> Number of farms: {{ totalFarms }}</div>
        <div> Current farm processing: {{ currentFarm }}</div>
        <div> Processed farm users: {{ processedUsers }}</div>

        <div> Percent EB: {{ percentEB }}</div>
        <div> Total EB distributed: {{ totalUnlockedEB }}</div>

        <div> Percent Staking: {{ percentStaking }}</div>
        <div> Total Staking distributed: {{ totalUnlockedStaking }}</div>
        <br>
        <Button class='button--green' size="large" ghost @click="processBalances">Process balances</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetEB">update EB</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetStaking">update Staking</Button>
        <br>
        <br>
        <div >Votes: {{ votes }} </div>
        <br>
        <input v-model="votes1" placeholder="votes1">
        <input v-model="votes2" placeholder="votes2">
        <Button class='button--green' size="large" ghost @click="castVotes">Cast votes</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ethers } from 'ethers'
import Invoker from '../services/web3.ts'
import { availableLP } from '../services/constants.ts'

 export default Vue.extend({
     data () {
         return {
             invoker: {},
             balanceGTONBSC: " ",
             balanceGTONETH: " ",
             balanceGTONPLG: " ",
             balanceGTONFTM: " ",
             balanceGovernance: " ",
             userAddress: " ",
             userId: " ",
             processedUsers: " ",
             currentFarm: " ",
             totalFarms: " ",
             currentFarm: " ",
             totalUnlockedEB: " ",
             percentEB: " ",
             percentStaking: " ",
             totalUnlockedStaking: " ",
             claimAllowance: " ",
             balanceLPBSC: "",
             balanceLPETH: "",
             balanceLPPLG: "",
             lockedLPBSC: "",
             lockedLPETH: "",
             lockedLPPLG: "",
             lockedLPFTMBSC: "",
             lockedLPFTMETH: "",
             lockedLPFTMPLG: "",
             totalLPTokens: 0,
             votingRounds: 0,
             lpaddresses: [],
             lockGTONETHAmount: 0,
             lockGTONBSCAmount: 0,
             lockGTONPLGAmount: 0,
             lockLPBSCAmount: 0,
             unlockLPBSCAmount: 0,
             lockLPETHAmount: 0,
             unlockLPETHAmount: 0,
             lockLPPLGAmount: 0,
             unlockLPPLGAmount: 0,
             claimAmount: 0,
             roundId: 0,
             votes1: 0,
             votes2: 0,
             votes: ""
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
         },
         clear () {
             this.balanceGTONFTM       = ""
             this.balanceGTONETH       = ""
             this.balanceGTONPLG       = ""
             this.balanceGTONBSC       = ""
             this.balanceGovernance    = ""
             this.userAddress          = ""
             this.userId               = ""
             this.processedUsers       = ""
             this.currentFarm          = ""
             this.totalFarms           = ""
             this.currentFarm          = ""
             this.totalUnlockedEB      = ""
             this.percentEB            = ""
             this.percentStaking       = ""
             this.totalUnlockedStaking = ""
             this.claimAllowance       = ""
             this.totalLPTokens        = ""
             this.balanceLPBSC         = ""
             this.lockedLPBSC          = ""
             this.balanceLPETH         = ""
             this.lockedLPETH          = ""
             this.balanceLPPLG         = ""
             this.lockedLPPLG          = ""
             this.lockedLPFTMBSC       = ""
             this.lockedLPFTMETH       = ""
             this.lockedLPFTMPLG       = ""
             this.votingRounds         = ""
             this.votes                = ""
         },
         async update () {
             this.clear()
             this.balanceGTONFTM       = await this.invoker.balanceGTON('FTM')
             this.balanceGTONETH       = await this.invoker.balanceGTON('ETH')
             this.balanceGTONPLG       = await this.invoker.balanceGTON('PLG')
             this.balanceGTONBSC       = await this.invoker.balanceGTON('BSC')
             this.balanceGovernance    = await this.invoker.balanceGovernance()
             this.userAddress          = await this.invoker.userAddress()
             this.userId               = await this.invoker.userId()
             this.processedUsers       = await this.invoker.processedUsers()
             this.currentFarm          = await this.invoker.currentFarm()
             this.totalFarms           = await this.invoker.totalFarms()
             this.currentFarm          = await this.invoker.currentFarm()
             this.totalUnlockedEB      = await this.invoker.totalUnlockedEB()
             this.percentEB            = await this.invoker.percentEB()
             this.percentStaking       = await this.invoker.percentStaking()
             this.totalUnlockedStaking = await this.invoker.totalUnlockedStaking()
             this.claimAllowance       = await this.invoker.claimAllowance()
             this.totalLPTokens        = await this.invoker.totalLPTokens()
             this.balanceLPBSC         = await this.invoker.balanceLP('BSC')
             this.lockedLPBSC          = await this.invoker.lockedLP('BSC')
             this.balanceLPETH         = await this.invoker.balanceLP('ETH')
             this.lockedLPETH          = await this.invoker.lockedLP('ETH')
             this.balanceLPPLG         = await this.invoker.balanceLP('PLG')
             this.lockedLPPLG          = await this.invoker.lockedLP('PLG')
             this.lockedLPFTMBSC       = await this.invoker.lockedLPFTM('BSC')
             this.lockedLPFTMETH       = await this.invoker.lockedLPFTM('ETH')
             this.lockedLPFTMPLG       = await this.invoker.lockedLPFTM('PLG')
             this.votingRounds         = await this.invoker.votingRounds()
             const votes0              = await this.invoker.votes("0", "0", this.userId)
             const option0             = await this.invoker.voteOption("0", "0")
             const votes1              = await this.invoker.votes("0", "1", this.userId)
             const option1             = await this.invoker.voteOption("0", "1")
             this.votes                = option0 + ": " + votes0 + "; " + option1 + ": " + votes1
         },
         async approveGTON (chain) {
             var amount: number
             if (chain == "ETH") {
                 amount = this.lockGTONETHAmount
             } else if (chain == "BSC") {
                 amount = this.lockGTONBSCAmount
             } else if (chain == "PLG") {
                 amount = this.lockGTONPLGAmount
             } else {
                 return
             }
             try {
                 await this.invoker.approveGTON(chain, amount)
             } catch(e) {console.log("error: approveGTON", chain, amount, e)}
         },
         async lockGTON (chain) {
             var amount: number
             if (chain == "ETH") {
                 amount = this.lockGTONETHAmount
             } else if (chain == "BSC") {
                 amount = this.lockGTONBSCAmount
             } else if (chain == "PLG") {
                 amount = this.lockGTONPLGAmount
             } else {
                 return
             }
             try {
             await this.invoker.lockGTON(chain, amount)
             } catch(e) { console.log(e) }
         },
         async approveLP (chain) {
             var amount: number
             if (chain == "ETH") {
                 amount = this.lockLPETHAmount
             } else if (chain == "BSC") {
                 amount = this.lockLPBSCAmount
             } else if (chain == "PLG") {
                 amount = this.lockLPPLGAmount
             } else {
                 return
             }
             try {
             await this.invoker.approveLP(chain, this.lptoken, amount)
             } catch(e) { console.log(e) }
         },
         async lockLP (chain) {
             var amount: number
             if (chain == "ETH") {
                 amount = this.lockLPETHAmount
             } else if (chain == "BSC") {
                 amount = this.lockLPBSCAmount
             } else if (chain == "PLG") {
                 amount = this.lockLPPLGAmount
             } else {
                 return
             }
             try {
             await this.invoker.lockLP(chain, this.lptoken, amount)
             } catch(e) { console.log(e) }
         },
         async unlockLP (chain) {
             var amount: number
             if (chain == "ETH") {
                 amount = this.unlockLPETHAmount
             } else if (chain == "BSC") {
                 amount = this.unlockLPBSCAmount
             } else if (chain == "PLG") {
                 amount = this.unlockLPPLGAmount
             } else {
                 return
             }
             try {
             await this.invoker.unlockLP(chain, this.lptoken, amount)
             } catch(e) { console.log(e) }
         },
         async processBalances () {
             try {
             await this.invoker.processBalances()
             } catch(e) { console.log(e) }
         },
         async unlockAssetEB () {
             try {
               await this.invoker.unlockAssetEB()
             } catch(e) { console.log(e) }
         },
         async unlockAssetStaking () {
             try {
             await this.invoker.unlockAssetStaking()
             } catch(e) { console.log(e) }
         },
         async claim () {
             try {
               await this.invoker.claim(this.claimAmount)
             } catch(e) { console.log(e) }
         },
         async castVotes () {
             try {
             await this.invoker.castVotes(0, this.votes1, this.votes2)
             } catch(e) { console.log(e) }
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
