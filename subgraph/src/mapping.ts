import { store } from "@graphprotocol/graph-ts";
import { ListedToken06r3 } from "../generated/schema";
import { BuyCall, ListCall, UnlistCall } from "../generated/Market/Market"
export function handleBuy(tx: BuyCall): void {
  let id = tx.inputs.tokenID.toHexString()
  store.remove('ListedToken',id)
}

export function handleUnlist(tx: UnlistCall): void {
  let id = tx.inputs.id.toHexString()
  store.remove('ListedToken',id)
}

export function handleList(tx: ListCall): void {
  let id = tx.inputs.tokenID.toHexString()
  let token = new ListedToken06r3(id)
  token.tokenID = tx.inputs.tokenID
  token.owner = tx.from.toHexString()
  token.price = tx.inputs.price
  
  token.save()
}

