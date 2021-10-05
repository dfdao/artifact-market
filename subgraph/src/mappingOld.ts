import { store, Address } from "@graphprotocol/graph-ts";
import { CurrentListing, TokenSale } from "../generated/schema";
import { BuyCall, ListCall, UnlistCall } from "../generated/Market/Market"
import { hexStringToPaddedUnprefixed} from './helpers/converters'
import { DarkForestGetters } from "../generated/MarketEvents/DarkForestGetters";
import { getListFromContractData } from "./helpers/decoders";

export function handleBuy(tx: BuyCall): void {

  let id = hexStringToPaddedUnprefixed(tx.inputs.tokenID.toHexString())
  let sale = new TokenSale(tx.transaction.hash.toHex())
  let listing = CurrentListing.load(id)!
  sale.price = listing.price
  sale.artifactType = listing.artifactType
  sale.planetBiome = listing.planetBiome
  sale.rarity = listing.rarity
  sale.price = listing.price
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

  let getters = DarkForestGetters.bind(Address.fromString('0x6C5b4B9b835e4e085C5B8124E44045D5b3b57Cd9'))
  let rawArtifact = getters.bulkGetArtifactsByIds([tx.inputs.tokenID]);
  let token = getListFromContractData(tx.inputs.tokenID, rawArtifact)
  token.sellerAddress = tx.from.toHexString()
  token.price = tx.inputs.price
  token.round = '0.6 round 3'
  token.idDec = tx.inputs.tokenID
  token.listedAtTimestamp = tx.block.timestamp
  token.save()
}

