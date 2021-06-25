<p align="center">
  <img src="https://graviton.one/_nuxt/img/nav-logo.2809ecd.svg" width="300" alt="Graviton">
  <h3 align="center">Graviton</h3>
  <p align="center">Smart contracts for the Graviton project</p>
</p>

## Contracts ⚡

Find documentation for V2 contracts in `contract/interfaces`.

- `BalanceKeeperV2.sol` tracks governance balances of gton holders
- `BalanceAdderV2.sol` unlocks gton to governance balances accorind to farming campaigns
- `SharesEB.sol` tracks deposits of early birds
- `FarmCurved.sol` calculates early birds unlocking schedule 
- `FarmLinear.sol` calculates linear staking schedule
- `SharesLP.sol` tracks shares in LP farming
- `LPKeeperV2.sol` tracks locked LP tokens
- `VoterV2.sol` holds voting matches using governance balance from `BalanceKeeper.sol`
- `ClaimGTON.sol` transfers governance tokens from the balance
- `LockGTON.sol` and `LockUnlockLP.sol` lock governance and lp-tokens on various blockchains
- `OracleParserV2.sol` and `OracleRouterV2.sol` handle crosschain locking

## Usage

```bash
yarn
yarn run hardhat compile
yarn run hardhat test
yarn run hardhat coverage
yarn run nuxt dev
```
