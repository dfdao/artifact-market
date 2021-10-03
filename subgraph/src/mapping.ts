import { store } from "@graphprotocol/graph-ts";
import { ListedToken06R3, TokenSale } from "../generated/schema";
import { BuyCall, ListCall, UnlistCall } from "../generated/Market/Market"
export function handleBuy(tx: BuyCall): void {
  let id = tx.inputs.tokenID.toHexString()
  let x = tx.transaction.hash.toHex()
  let sale = new TokenSale(x)
  sale.price = (store.get('ListedToken06R3',id) as ListedToken06R3).price
  sale.tokenID = tx.inputs.tokenID
  sale.round= '0.6 round 3'
  sale.save()
  store.remove('ListedToken06R3',id)
}

export function handleUnlist(tx: UnlistCall): void {
  let id = tx.inputs.id.toHexString()
  store.remove('ListedToken06R3',id)
}

export function handleList(tx: ListCall): void {
  let id = tx.inputs.tokenID.toHexString()
  let token = new ListedToken06R3(id)
  token.tokenID = tx.inputs.tokenID
  token.owner = tx.from.toHexString()
  token.price = tx.inputs.price
  
  token.save()
}

