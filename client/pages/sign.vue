<template>
  <div class="container">
    <div>
      <div>
        <input v-model="digest" placeholder="digest">
        <Button class='button--green' size="large" ghost @click="signDigest">Sign digest</Button>
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
             digest: ""
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
         // async signDigest () {
         //     try {
         //     await this.invoker.signDigest(ethers.)
         //     } catch(e) { console.log(e) }
         // }
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
