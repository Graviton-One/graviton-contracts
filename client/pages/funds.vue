<template>
  <div class="container">
    <div>
      <div>
        <Button class='button--green' size="large" ghost @click="update">Update</Button>
        <table class="table table-hover">
            <thead>
                <tr>
                    <td>contract</td>
                    <td>FTM</td>
                    <td>PLG</td>
                    <td>BSC</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>consul1</td>
                    <td>{{ formatUnits(consul1_FTM, 18) }} FTM  </td>
                    <td>{{ formatUnits(consul1_PLG, 18) }} MATIC</td>
                    <td>{{ formatUnits(consul1_BSC, 18) }} BNB  </td>
                </tr>
                <tr>
                    <td>consul2</td>
                    <td>{{ formatUnits(consul2_FTM, 18) }} FTM  </td>
                    <td>{{ formatUnits(consul2_PLG, 18) }} MATIC</td>
                    <td>{{ formatUnits(consul2_BSC, 18) }} BNB  </td>
                </tr>
                <tr>
                    <td>consul3</td>
                    <td>{{ formatUnits(consul3_FTM, 18) }} FTM  </td>
                    <td>{{ formatUnits(consul3_PLG, 18) }} MATIC</td>
                    <td>{{ formatUnits(consul3_BSC, 18) }} BNB  </td>
                </tr>
                <tr>
                    <td>team</td>
                    <td>{{ formatUnits(team_FTM, 18) }} FTM  </td>
                    <td>{{ formatUnits(team_PLG, 18) }} MATIC</td>
                    <td>{{ formatUnits(team_BSC, 18) }} BNB  </td>
                </tr>
                <tr>
                    <td>team gton</td>
                    <td>{{ formatUnits(team_gton_FTM, 18) }} GTON</td>
                    <td>{{ formatUnits(team_gton_PLG, 18) }} GTON</td>
                    <td>{{ formatUnits(team_gton_BSC, 18) }} GTON</td>
                </tr>
                <tr>
                    <td>relay</td>
                    <td>{{ formatUnits(relay_FTM, 18) }} GTON</td>
                    <td>{{ formatUnits(relay_PLG, 18) }} GTON</td>
                    <td>{{ formatUnits(relay_BSC, 18) }} GTON</td>
                </tr>
                <tr>
                    <td>bot</td>
                    <td>{{ formatUnits(bot_FTM, 18) }} FTM</td>
                </tr>
                <tr>
                    <td>claim</td>
                    <td>{{ formatUnits(claim_FTM, 18) }} GTON</td>
                </tr>
                <tr>
                    <td>claim allowance</td>
                    <td>{{ formatUnits(claim_allowance_FTM, 18) }} GTON</td>
                </tr>
            </tbody>
        </table>
        <table class="table table-hover">
            <thead>
                <tr>
                    <td>contract</td>
                    <td>ETH</td>
                    <td>DAI</td>
                    <td>AVA</td>
                    <td>HECO</td>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>consul1</td>
                    <td>{{ formatUnits(consul1_ETH, 18) }} ETH  </td>
                    <td>{{ formatUnits(consul1_DAI, 18) }} xDAI </td>
                    <td>{{ formatUnits(consul1_AVA, 18) }} AVA  </td>
                    <td>{{ formatUnits(consul1_HEC, 18) }} HECO  </td>
                </tr>
                <tr>
                    <td>consul2</td>
                    <td>{{ formatUnits(consul2_ETH, 18) }} ETH  </td>
                    <td>{{ formatUnits(consul2_DAI, 18) }} xDAI </td>
                    <td>{{ formatUnits(consul2_AVA, 18) }} AVA  </td>
                    <td>{{ formatUnits(consul2_HEC, 18) }} HECO  </td>
                </tr>
                <tr>
                    <td>consul3</td>
                    <td>{{ formatUnits(consul3_ETH, 18) }} ETH  </td>
                    <td>{{ formatUnits(consul3_DAI, 18) }} xDAI </td>
                    <td>{{ formatUnits(consul3_AVA, 18) }} AVA  </td>
                    <td>{{ formatUnits(consul3_HEC, 18) }} HECO  </td>
                </tr>
                <tr>
                    <td>team</td>
                    <td>{{ formatUnits(team_ETH, 18) }} ETH  </td>
                    <td>{{ formatUnits(team_DAI, 18) }} xDAI </td>
                    <td>{{ formatUnits(team_AVA, 18) }} AVA  </td>
                    <td>{{ formatUnits(team_HEC, 18) }} HECO  </td>
                </tr>
                <tr>
                    <td>team gton</td>
                    <td>{{ formatUnits(team_gton_ETH, 18) }} GTON</td>
                    <td>{{ formatUnits(team_gton_DAI, 18) }} GTON</td>
                    <td>{{ formatUnits(team_gton_AVA, 18) }} GTON</td>
                    <td>{{ formatUnits(team_gton_HEC, 18) }} GTON</td>
                </tr>
                <tr>
                    <td>relay</td>
                    <td>{{ formatUnits(relay_ETH, 18) }} GTON</td>
                    <td>{{ formatUnits(relay_DAI, 18) }} GTON</td>
                    <td>{{ formatUnits(relay_AVA, 18) }} GTON</td>
                    <td>{{ formatUnits(relay_HEC, 18) }} GTON</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { ethers, BigNumber } from 'ethers'
import Invoker from '../services/web3.ts'
import { FTM, BSC, PLG, ETH, AVA, DAI, HEC } from '../services/constants.ts'

 export default Vue.extend({
     data () {
         return {
             invoker: {},
             consul1_FTM: BigNumber.from(0),
             consul1_PLG: BigNumber.from(0),
             consul1_BSC: BigNumber.from(0),
             consul1_ETH: BigNumber.from(0),
             consul1_DAI: BigNumber.from(0),
             consul1_AVA: BigNumber.from(0),
             consul1_HEC: BigNumber.from(0),
             consul2_FTM: BigNumber.from(0),
             consul2_PLG: BigNumber.from(0),
             consul2_BSC: BigNumber.from(0),
             consul2_ETH: BigNumber.from(0),
             consul2_DAI: BigNumber.from(0),
             consul2_AVA: BigNumber.from(0),
             consul2_HEC: BigNumber.from(0),
             consul3_FTM: BigNumber.from(0),
             consul3_PLG: BigNumber.from(0),
             consul3_BSC: BigNumber.from(0),
             consul3_ETH: BigNumber.from(0),
             consul3_DAI: BigNumber.from(0),
             consul3_AVA: BigNumber.from(0),
             consul3_HEC: BigNumber.from(0),
             relay_FTM: BigNumber.from(0),
             relay_PLG: BigNumber.from(0),
             relay_BSC: BigNumber.from(0),
             relay_ETH: BigNumber.from(0),
             relay_DAI: BigNumber.from(0),
             relay_AVA: BigNumber.from(0),
             relay_HEC: BigNumber.from(0),
             team_FTM: BigNumber.from(0),
             team_PLG: BigNumber.from(0),
             team_BSC: BigNumber.from(0),
             team_ETH: BigNumber.from(0),
             team_DAI: BigNumber.from(0),
             team_AVA: BigNumber.from(0),
             team_HEC: BigNumber.from(0),
             team_gton_FTM: BigNumber.from(0),
             team_gton_PLG: BigNumber.from(0),
             team_gton_BSC: BigNumber.from(0),
             team_gton_ETH: BigNumber.from(0),
             team_gton_DAI: BigNumber.from(0),
             team_gton_AVA: BigNumber.from(0),
             team_gton_HEC: BigNumber.from(0),
             bot_FTM: BigNumber.from(0),
             claim_FTM: BigNumber.from(0),
             claim_allowance_FTM: BigNumber.from(0)
         }
     },

     async mounted () {
         await this.connect()
         await this.update()
     },

     methods: {
         async connect () {
             const provider = new ethers.providers.JsonRpcProvider("https://rpcapi.fantom.network")
             this.invoker = new Invoker(provider)
             console.log("Invoker loaded:", this.invoker)
         },
         clear () {
             this.consul1_FTM = BigNumber.from(0)
             this.consul1_PLG = BigNumber.from(0)
             this.consul1_BSC = BigNumber.from(0)
             this.consul1_ETH = BigNumber.from(0)
             this.consul1_DAI = BigNumber.from(0)
             this.consul1_AVA = BigNumber.from(0)
             this.consul1_HEC = BigNumber.from(0)
             this.consul2_FTM = BigNumber.from(0)
             this.consul2_PLG = BigNumber.from(0)
             this.consul2_BSC = BigNumber.from(0)
             this.consul2_ETH = BigNumber.from(0)
             this.consul2_DAI = BigNumber.from(0)
             this.consul2_AVA = BigNumber.from(0)
             this.consul2_HEC = BigNumber.from(0)
             this.consul3_FTM = BigNumber.from(0)
             this.consul3_PLG = BigNumber.from(0)
             this.consul3_BSC = BigNumber.from(0)
             this.consul3_ETH = BigNumber.from(0)
             this.consul3_DAI = BigNumber.from(0)
             this.consul3_AVA = BigNumber.from(0)
             this.consul3_HEC = BigNumber.from(0)
             this.relay_FTM = BigNumber.from(0)
             this.relay_PLG = BigNumber.from(0)
             this.relay_BSC = BigNumber.from(0)
             this.relay_ETH = BigNumber.from(0)
             this.relay_DAI = BigNumber.from(0)
             this.relay_AVA = BigNumber.from(0)
             this.relay_HEC = BigNumber.from(0)
             this.team_FTM = BigNumber.from(0)
             this.team_PLG = BigNumber.from(0)
             this.team_BSC = BigNumber.from(0)
             this.team_ETH = BigNumber.from(0)
             this.team_DAI = BigNumber.from(0)
             this.team_AVA = BigNumber.from(0)
             this.team_HEC = BigNumber.from(0)
             this.team_gton_FTM = BigNumber.from(0)
             this.team_gton_PLG = BigNumber.from(0)
             this.team_gton_BSC = BigNumber.from(0)
             this.team_gton_ETH = BigNumber.from(0)
             this.team_gton_DAI = BigNumber.from(0)
             this.team_gton_AVA = BigNumber.from(0)
             this.team_gton_HEC = BigNumber.from(0)
             this.bot_FTM = BigNumber.from(0)
             this.claim_FTM = BigNumber.from(0)
             this.claim_allowance_FTM = BigNumber.from(0)
         },
         async update () {
             this.clear()
             try { this.consul1_FTM = await this.invoker.balanceNT(FTM.provider, FTM.consul1) } catch(e) { console.log(e) }
             try { this.consul1_PLG = await this.invoker.balanceNT(PLG.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul1_BSC = await this.invoker.balanceNT(BSC.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul1_ETH = await this.invoker.balanceNT(ETH.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul1_DAI = await this.invoker.balanceNT(DAI.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul1_AVA = await this.invoker.balanceNT(AVA.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul1_HEC = await this.invoker.balanceNT(HEC.provider, FTM.consul1) } catch(e) { console.log(e)}
             try { this.consul2_FTM = await this.invoker.balanceNT(FTM.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_PLG = await this.invoker.balanceNT(PLG.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_BSC = await this.invoker.balanceNT(BSC.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_ETH = await this.invoker.balanceNT(ETH.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_DAI = await this.invoker.balanceNT(DAI.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_AVA = await this.invoker.balanceNT(AVA.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul2_HEC = await this.invoker.balanceNT(HEC.provider, FTM.consul2) } catch(e) { console.log(e)}
             try { this.consul3_FTM = await this.invoker.balanceNT(FTM.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_PLG = await this.invoker.balanceNT(PLG.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_BSC = await this.invoker.balanceNT(BSC.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_ETH = await this.invoker.balanceNT(ETH.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_DAI = await this.invoker.balanceNT(DAI.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_AVA = await this.invoker.balanceNT(AVA.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.consul3_HEC = await this.invoker.balanceNT(HEC.provider, FTM.consul3) } catch(e) { console.log(e)}
             try { this.relay_FTM =   await this.invoker.balanceOf(FTM.provider, FTM.gton, FTM.relayLock) } catch(e) { console.log(e)}
             try { this.relay_PLG =   await this.invoker.balanceOf(PLG.provider, PLG.gton, PLG.relayLock) } catch(e) { console.log(e)}
             try { this.relay_BSC =   await this.invoker.balanceOf(BSC.provider, BSC.gton, BSC.relayLock) } catch(e) { console.log(e)}
             try { this.relay_ETH =   await this.invoker.balanceOf(ETH.provider, ETH.gton, ETH.relayLock) } catch(e) { console.log(e)}
             try { this.relay_DAI =   await this.invoker.balanceOf(DAI.provider, DAI.gton, DAI.relayLock) } catch(e) { console.log(e)}
             try { this.relay_AVA =   await this.invoker.balanceOf(AVA.provider, AVA.gton, AVA.relayLock) } catch(e) { console.log(e)}
             try { this.relay_HEC =   await this.invoker.balanceOf(HEC.provider, HEC.gton, HEC.relayLock) } catch(e) { console.log(e)}
             try { this.team_FTM = await this.invoker.balanceNT(FTM.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_PLG = await this.invoker.balanceNT(PLG.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_BSC = await this.invoker.balanceNT(BSC.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_ETH = await this.invoker.balanceNT(ETH.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_DAI = await this.invoker.balanceNT(DAI.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_AVA = await this.invoker.balanceNT(AVA.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_HEC = await this.invoker.balanceNT(HEC.provider, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_FTM = await this.invoker.balanceOf(FTM.provider, FTM.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_PLG = await this.invoker.balanceOf(PLG.provider, PLG.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_BSC = await this.invoker.balanceOf(BSC.provider, BSC.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_ETH = await this.invoker.balanceOf(ETH.provider, ETH.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_DAI = await this.invoker.balanceOf(DAI.provider, DAI.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_AVA = await this.invoker.balanceOf(AVA.provider, AVA.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.team_gton_HEC = await this.invoker.balanceOf(HEC.provider, HEC.gton, FTM.team) } catch(e) { console.log(e)}
             try { this.bot_FTM =       await this.invoker.balanceNT(FTM.provider, FTM.bot) } catch(e) { console.log(e)}
             try { this.claim_FTM =     await this.invoker.balanceOf(FTM.provider, FTM.gton, FTM.claimWallet) } catch(e) { console.log(e)}
             try { this.claim_allowance_FTM =     await this.invoker.allowance(FTM.provider, FTM.gton, FTM.claimWallet, FTM.claim) } catch(e) { console.log(e)}
         },
         formatUnits(amount: BigNumber, precision: number): string {
             return ethers.utils.formatUnits(amount, precision);
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
