<template>
  <div class="container">
      <div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>

        <div> User Address: {{ userAddress }}</div>
        <div> User Id: {{ userId }}</div>

        <div> GTON balance fantom: {{ balanceGTONBSC }}</div>
        <div> GTON balance fantom: {{ balanceGTONFTM }}</div>
        <div> Governance balance: {{ balanceGovernance }}</div>

        <div> Number of farms: {{ totalFarms }}</div>
        <div> Current farm processing: {{ currentFarm }}</div>
        <div> Processed farm users: {{ processedUsers }}</div>

        <div> Percent EB: {{ percentEB }}</div>
        <div> Total EB distributed: {{ totalUnlockedEB }}</div>

        <div> Percent Staking: {{ percentStaking }}</div>
        <div> Total Staking distributed: {{ totalUnlockedStaking }}</div>

        <div> GTON available to claim: {{ claimAllowance }}</div>

        <!-- <div v-for="(lp, index) in lpaddresses" :key="index">locked LP: {{ lockedLP(lp) }}</div> -->
        <!-- <div v-for="tokenId in totalLPTokens">{{ balanceLP(tokenId) }}</div> -->
        <!-- <div v-for="roundId in votingRounds"> {{ votes(roundId) }}</div> -->

        <Button class='button--green' size="large" ghost @click="lockGTON">Lock GTON</Button>
        <Button class='button--green' size="large" ghost @click="lockLP">Lock LP</Button>
        <Button class='button--green' size="large" ghost @click="unlockLP">Unlock LP</Button>
        <br>
        <Button class='button--green' size="large" ghost @click="claim">Claim</Button>
        <br>
        <Button class='button--green' size="large" ghost @click="processBalances">Process balances</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetEB">update EB</Button>
        <Button class='button--green' size="large" ghost @click="unlockAssetStaking">update Staking</Button>
        <br>
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
             totalLPTokens: 0,
             votingRounds: 0,
             lpaddresses: []
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
             this.votingRounds         = await this.invoker.votingRounds()
         },
         async lockedLP (id): string {
             return await this.invoker.lockedLP(id)
         },
         async lockGTON () {
             await this.invoker.lockGTON(this.amountLockGTON)
         },
         async balanceLP (id): string {
             return await this.invoker.balanceLP(id)
         },
         async lockLP () {
             await this.invoker.lockLP(this.lptoken, this.amountLockGTON)
         },
         async unlockLP () {
             await this.invoker.unlockLP(this.lptoken, this.amountLockGTON)
         },
         async processBalances () {
             await this.invoker.processBalances()
         },
         async unlockAssetEB () {
             await this.invoker.unlockAssetEB()
         },
         async unlockAssetStaking () {
             await this.invoker.unlockAssetStaking()
         },
         async claim () {
             await this.invoker.claim(this.amountClaim)
         },
         async castVotes () {
             await this.invoker.castVotes(this.amountVotes)
         },
         async votes (roundId) {
             return this.invoker.votes(roundId)
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
