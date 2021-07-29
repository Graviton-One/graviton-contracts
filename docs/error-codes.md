---
id: error-codes
title: Error Codes
---


BalanceAdderV2.sol

* `ACW` : Caller is not owner
* `BA` : farm is processing balances

BalanceKeeperV2.sol

* `ACW` : Caller is not owner
* `ACO` : not allowed to open
* `ACA` : not allowed to add
* `ACS` : not allowed to subtract
* `BK1` : user is not known
* `BK2` : index larger that total users

ClaimGTONPercent.sol

* `ACW` : Caller is not owner
* `C1`  : can't claim
* `C2`  : not enough money
* `C3`  : exceeded daily limit

ClaimGTONAbsolute.sol

* `ACW` : Caller is not owner
* `C1`  : can't claim
* `C2`  : not enough money
* `C3`  : exceeded daily limit

FarmCurved.sol

* `ACW` : Caller is not owner
* `F1`  : farming has not started yet
* `F2`  : farming has been stopped

FarmLinear.sol

* `ACW` : Caller is not owner
* `F1`  : farming has not started yet
* `F2`  : farming has been stopped

LPKeeperV2.sol

* `ACW` : Caller is not owner
* `ACO` : not allowed to open
* `ACA` : not allowed to add
* `ACS` : not allowed to subtract
* `LK1` : token is not known
* `LK2` : no token users
* `LK3` : token user is not known
* `LK4` : user is not known

LockGTON.sol

* `ACW` : Caller is not owner
* `LG1` : lock is not allowed

LockGTONOnchain.sol

* `ACW` : Caller is not owner
* `LG1` : lock is not allowed

LockUnlockLP.sol

* `ACW` : Caller is not owner
* `LP1` : lock is not allowed 
* `LP2` : token not allowed 
* `LP3` : limit exceeded 
* `LP4` : not enough balance 

LockUnlockLPOnchain.sol

* `ACW` : Caller is not owner
* `LP1` : lock is not allowed
* `LP2` : token not allowed
* `LP3` : limit exceeded
* `LP4` : not enough balance

OracleParserV2.sol

* `ACW` : Caller is not owner
* `ACN` : Caller is not nebula

OracleRouterV2.sol

* `ACW` : Caller is not owner
* `ACR` : not allowed to route value

SharesEB.sol

SharesLP.sol

* `SL1` : token is not known

VoterV2.sol

* `ACW` : Caller is not owner
* `ACV` : not allowed to cast votes
* `ACC` : sender is not allowed to check balances
* `V1`  : no such round
* `V2`  : no such option
* `V3`  : roundId is not an active vote
* `V4`  : number of votes doesn't match the number of options
* `V5`  : balance is smaller than the sum of votes