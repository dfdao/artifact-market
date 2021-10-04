import { store, Address, DataSourceContext, dataSource, log } from "@graphprotocol/graph-ts";
import { Sale, Listed, Unlisted } from '../generated/templates/MarketEvents/MarketEvents'
import { MarketEvents } from "../generated/templates";
import { MarketFactory , NewRoundCall } from '../generated/MarketFactory/MarketFactory'
import { CurrentListing, TokenSale } from '../generated/schema'
import { DarkForestTokens } from '../generated/templates/MarketEvents/DarkForestTokens';
import { getListFromContractData } from './helpers/decoders';
import { hexStringToPaddedUnprefixed } from "./helpers/converters";

export function handleSale(event: Sale): void {
    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    let x = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let sale = new TokenSale(x)
    let listing = CurrentListing.load(id)!
    sale.idDec = listing.idDec
    sale.artifactType = listing.artifactType
    sale.planetBiome = listing.planetBiome
    sale.rarity = listing.rarity
    sale.price = listing.price
    sale.round = '0.6 round 4'
    sale.soldAtTimestamp = event.block.timestamp
    sale.buyerAddress = event.params.buyer.toHexString()
    sale.save()
    store.remove('CurrentListing',id)
}

export function handleListed(event: Listed): void {
    let context = dataSource.context()
    let tokens = DarkForestTokens.bind(Address.fromString(context.getString('tokens')));
    let rawArtifact = tokens.getArtifact(event.params.id);

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
    let context = new DataSourceContext()
    context.setString('tokens',tx.inputs.newTokens.toHexString())
    MarketEvents.createWithContext(tx.inputs.newTokens,context)
}