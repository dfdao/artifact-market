import { store } from "@graphprotocol/graph-ts";
import { CurrentListing, TokenSale } from "../generated/schema";
import { BuyCall, ListCall, UnlistCall } from "../generated/Market/Market"
import { hexStringToPaddedUnprefixed} from './helpers/converters'


export function handleBuy(tx: BuyCall): void {

  let id = hexStringToPaddedUnprefixed(tx.inputs.tokenID.toHexString())
  let sale = new TokenSale(tx.transaction.hash.toHex())
  sale.price = CurrentListing.load(id)!.price
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
  let token = new CurrentListing(hexStringToPaddedUnprefixed(tx.inputs.tokenID.toHexString()))
  token.sellerAddress = tx.from.toHexString()
  token.price = tx.inputs.price
  token.round = '0.6 round 3'
  token.idDec = tx.inputs.tokenID
  token.listedAtTimestamp = tx.block.timestamp
  token.save()
}

