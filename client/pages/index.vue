<template>
  <div class="container">
      <div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>

        <div> User Address: {{ userAddress }}</div>
        <div> User Id: {{ userId }}</div>

        <div> GTON balance binance: {{ balanceGTONBSC }}</div>
        <div> GTON balance fantom: {{ balanceGTONFTM }}</div>
        <div> Governance balance: {{ balanceGovernance }}</div>

        <div> LP balance: {{ balanceLPBSC }}</div>
        <div> LP locked BSC: {{ lockedLPBSC }}</div>
        <div> LP counted on FTM: {{ lockedLPFTM }}</div>

        <div> Number of farms: {{ totalFarms }}</div>
        <div> Current farm processing: {{ currentFarm }}</div>
        <div> Processed farm users: {{ processedUsers }}</div>

        <div> Percent EB: {{ percentEB }}</div>
        <div> Total EB distributed: {{ totalUnlockedEB }}</div>

        <div> Percent Staking: {{ percentStaking }}</div>
        <div> Total Staking distributed: {{ totalUnlockedStaking }}</div>

        <div> GTON available to claim: {{ claimAllowance }}</div>

        <div >Votes: {{ votes }} </div>

        <Button class='button--green' size="large" ghost @click="faucet">Faucet</Button>
        <br>
        <input v-model="lockGTONAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveGTON">Approve GTON</Button>
        <Button class='button--green' size="large" ghost @click="lockGTON">Lock GTON</Button>
        <br>
        <input v-model="lockLPAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="approveLP">Approve LP</Button>
        <Button class='button--green' size="large" ghost @click="lockLP">Lock LP</Button>
        <br>
        <input v-model="unlockLPAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="unlockLP">Unlock LP</Button>
        <br>
        <br>
        <input v-model="claimAmount" placeholder="amount">
        <Button class='button--green' size="large" ghost @click="claim">Claim</Button>
        <br>
        <br>
        <Button class='button--green' size="large" ghost @click="processBalances">Process balances</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetEB">update EB</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetStaking">update Staking</Button>
        <br>
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
             lockedLPBSC: "",
             lockedLPFTM: "",
             totalLPTokens: 0,
             votingRounds: 0,
             lpaddresses: [],
             lockGTONAmount: 0,
             lockLPAmount: 0,
             unlockLPAmount: 0,
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
             console.log(this.invoker)
         },
         async update () {
             this.lpaddresses          = availableLP
             this.balanceGTONFTM       = await this.invoker.balanceGTONFTM()
             this.balanceGTONBSC       = await this.invoker.balanceGTONBSC()
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
             this.balanceLPBSC         = await this.invoker.balanceLPBSC()
             this.lockedLPBSC          = await this.invoker.lockedLPBSC(this.lpaddresses[0])
             this.lockedLPFTM          = await this.invoker.lockedLPFTM(1)
             this.votingRounds         = await this.invoker.votingRounds()
             const votes0              = await this.invoker.votes("0", "0", this.userId)
             const option0             = await this.invoker.voteOption("0", "0")
             const votes1              = await this.invoker.votes("0", "1", this.userId)
             const option1             = await this.invoker.voteOption("0", "1")
             this.votes                = option0 + ": " + votes0 + "; " + option1 + ": " + votes1
         },
         async approveGTON () {
             try {
             await this.invoker.approveGTON(this.lockGTONAmount)
             } catch {}
         },
         async lockGTON () {
             try {
             await this.invoker.lockGTON(this.lockGTONAmount)
             } catch {}
         },
         async approveLP () {
             try {
             await this.invoker.approveLP(this.lptoken, this.lockLPAmount)
             } catch {}
         },
         async lockLP () {
             try {
             await this.invoker.lockLP(this.lptoken, this.lockLPAmount)
             } catch {}
         },
         async unlockLP () {
             try {
             await this.invoker.unlockLP(this.lptoken, this.unlockLPAmount)
             } catch {}
         },
         async processBalances () {
             try {
             await this.invoker.processBalances()
             } catch {}
         },
         async unlockAssetEB () {
             try {
               await this.invoker.unlockAssetEB()
             } catch {}
         },
         async unlockAssetStaking () {
             try {
             await this.invoker.unlockAssetStaking()
             } catch {}
         },
         async claim () {
             try {
               await this.invoker.claim(this.amountClaim)
             } catch {}
         },
         async castVotes () {
             try {
             await this.invoker.castVotes(0, this.votes1, this.votes2)
             } catch {}
         },
         async faucet () {
             try {
                 await this.invoker.faucet()
             } catch {}
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
