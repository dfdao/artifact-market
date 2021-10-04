/*
import { MarketEvents } from "../generated/templates";
import { NewRound } from '../generated/MarketFactory/MarketFactory'
import { DataSourceContext } from "@graphprotocol/graph-ts";
export function handleNewRound(event: NewRoundCall): void{
    let context = new DataSourceContext()
    context.setString('tokens',event.newTokens.toHexString())
    MarketEvents.createWithContext(event.newTokens,context)
}
*/