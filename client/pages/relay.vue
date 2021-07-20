<template>
  <div class="container">
    <div>
      <div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>
        <div> User Address: {{ userAddress }}</div>
        <br>
        <div> User balance FTM: {{ balanceFTM }}</div>
        <div> User balance BSC: {{ balanceBSC }}</div>
        <div> User balance PLG: {{ balancePLG }}</div>
        <input v-model="amount" placeholder="amount">
        <select v-model="source">
            <option v-for="chain in chains" v-bind:value="chain">
                {{chain}}
            </option>
        </select>
        <select v-model="destination">
            <option v-for="chain in chains" v-bind:value="chain">
                {{chain}}
            </option>
        </select>
        <Button class='button--green' size="large" ghost @click="lock()">Lock</Button>
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
             balanceBSC: "",
             balancePLG: "",
             balanceFTM: "",
             amount: "0",
             userAddress: "",
             chains: ["FTM", "BSC", "PLG"],
             destination: "FTM",
             source: "BSC"
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
             this.userAddress = ""
             this.balanceFTM  = ""
             this.balancePLG  = ""
             this.balanceBSC  = ""
         },
         async update () {
             this.clear()
             this.balanceFTM  = await this.invoker.balance('FTM')
             this.balancePLG  = await this.invoker.balance('PLG')
             this.balanceBSC  = await this.invoker.balance('BSC')
             this.userAddress = await this.invoker.userAddress()
         },
         async lock() {
             console.log(this.source)
             console.log(this.destination)
             console.log(this.amount)
             try {
                 await this.invoker.lockRelay(this.source, this.destination, this.amount)
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
