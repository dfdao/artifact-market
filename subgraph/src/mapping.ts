import { store, Address } from "@graphprotocol/graph-ts";
import { CurrentListing } from "../generated/schema";
import { BuyCall, ListCall, UnlistCall } from "../generated/Market/Market"
import { GETTERS_CONTRACT_ADDRESS } from '@darkforest_eth/contracts';
import { DarkForestGetters } from '../generated/DarkForestCore/DarkForestGetters';
import { getListFromContractData, getSaleFromContractData } from './helpers/decoders';
import { hexStringToPaddedUnprefixed} from './helpers/converters'



export function handleBuy(tx: BuyCall): void {

  const getters = DarkForestGetters.bind(Address.fromString(GETTERS_CONTRACT_ADDRESS));
  const rawArtifact = getters.bulkGetArtifactsByIds([tx.inputs.tokenID]);

  let id = hexStringToPaddedUnprefixed(tx.inputs.tokenID.toHexString())
  let sale = getSaleFromContractData(tx.transaction.hash.toHex(),rawArtifact[0])
  sale.price = CurrentListing.load(id).price
  sale.round= '0.6 round 3'
  sale.soldAtTimestamp = tx.block.timestamp
  sale.buyerAddress = tx.from.toHexString()
  sale.save()
  store.remove('CurrentListing',id)
}

export function handleUnlist(tx: UnlistCall): void {
  let id = hexStringToPaddedUnprefixed(tx.inputs.id.toHexString())
  store.remove('CurrentListing',id)
}

export function handleList(tx: ListCall): void {
  const getters = DarkForestGetters.bind(Address.fromString(GETTERS_CONTRACT_ADDRESS));
  const rawArtifact = getters.bulkGetArtifactsByIds([tx.inputs.tokenID]);
  let token = getListFromContractData(tx.inputs.tokenID,rawArtifact[0])
  token.sellerAddress = tx.from.toHexString()
  token.price = tx.inputs.price
  token.round = '0.6 round 3'
  token.listedAtTimestamp = tx.block.timestamp
  token.save()
}

