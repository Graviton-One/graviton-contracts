<p align="center">
  <img src="https://graviton.one/_nuxt/img/nav-logo.2809ecd.svg" width="300" alt="Graviton">
  <h3 align="center">Graviton</h3>
  <p align="center">Smart contracts for the Graviton project</p>
</p>

## Features ⚡


- `BalanceKeeper.sol` tracks governance balances of gton holders
- `ImpactAbstract.sol` and `ImpactBirds.sol` track deposits of early birds
- `Farm.sol` calculates early birds unlocking schedule 
- `BalanceEB.sol` unlocks gton to governance balances of early birds according to unlocking schedule
- `FarmLinear.sol` calculates linear staking schedule
- `BalanceStaking.sol` unlocks gton to governance balances according to staking schedule
- `Voter.sol` holds voting matches using governance balance from `BalanceKeeper.sol`.

## Usage

```bash
yarn
yarn test
```
