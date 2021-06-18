import { ethers } from 'hardhat'
import { makeValueParser } from '../test/shared/utilities'

const MOCK_UUID = "0x5ae47235f0844e55b26703b7cf385294";
const MOCK_CHAIN = "EVM";
const emiter = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
const token = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
const sender = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
const receiver = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"
const GTON_ADD_TOPIC = "0x0000000000000000000000000000000000000000000000000000000000000001"
const GTON_SUB_TOPIC = "0x0000000000000000000000000000000000000000000000000000000000000002"
const __LP_ADD_TOPIC = "0x0000000000000000000000000000000000000000000000000000000000000003"
const __LP_SUB_TOPIC = "0x0000000000000000000000000000000000000000000000000000000000000004"
const amount = "1000"

const mock = makeValueParser(MOCK_UUID,
                             MOCK_CHAIN,
                             emiter,
                             "0x04",
                             GTON_ADD_TOPIC,
                             token,
                             sender,
                             receiver,
                             amount)
 console.log(ethers.utils.hexlify(mock))
