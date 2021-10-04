import { store, Address, DataSourceContext, dataSource } from "@graphprotocol/graph-ts";
import { Sale, Listed, Unlisted } from '../generated/MarketEvents/MarketEvents'
import { MarketEvents } from "../generated/templates";
import { MarketFactory , NewRoundCall } from '../generated/MarketFactory/MarketFactory'
import { CurrentListing } from '../generated/schema'
import { DarkForestTokens } from '../generated/Market/DarkForestTokens';
import { getListFromContractData, getSaleFromContractData } from './helpers/decoders';
import { hexStringToPaddedUnprefixed } from "./helpers/converters";

export function handleSale(event: Sale): void {
    const context = dataSource.context()
    const tokens = DarkForestTokens.bind(Address.fromString(context.getString('tokens')));
    const rawArtifact = tokens.getArtifact(event.params.id);

    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    let x = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let sale = getSaleFromContractData(x,rawArtifact)
    sale.price = CurrentListing.load(id).price
    sale.round = '0.6 round 4'
    sale.soldAtTimestamp = event.block.timestamp
    sale.buyerAddress = event.params.buyer.toHexString()
    sale.save()
    store.remove('CurrentListing',id)
}

export function handleListed(event: Listed): void {
    const context = dataSource.context()
    const tokens = DarkForestTokens.bind(Address.fromString(context.getString('tokens')));
    const rawArtifact = tokens.getArtifact(event.params.id);

    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    let token = new CurrentListing(id);
    getListFromContractData(event.params.id, rawArtifact)
    token.sellerAddress = event.params.seller.toHexString()
    token.price = event.params.price
    token.round = '0.6 round 4'
    token.save()

}

export function handleUnlisted(event: Unlisted): void {
    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    store.remove('CurrentListing',id)
}

export function handleNewRound(tx: NewRoundCall): void{
    let factory  = MarketFactory.bind(Address.fromString('0xd12E15f2EFE5acd79333E869930FFF0F679A46f9'))
    if (tx.from == factory.admin()){
        let context = new DataSourceContext()
        context.setString('tokens',tx.inputs.newTokens.toHexString())
        MarketEvents.createWithContext(tx.inputs.newTokens,context)
    }
}