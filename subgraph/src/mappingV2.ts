import { store, Address } from "@graphprotocol/graph-ts";
import { Sale, Listed, Unlisted } from '../generated/MarketEvents/MarketEvents'
import { CurrentListing, TokenSale } from '../generated/schema'
import { DarkForestGetters, DarkForestGetters__getArtifactByIdResultRetStruct } from '../generated/MarketEvents/DarkForestGetters';
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
    
    let getters = DarkForestGetters.bind(Address.fromString('0x71eF8b8D795AEbaf6dd6a2A0397B5D3A0e2B226E'))
    let rawArtifact = getters.bulkGetArtifactsByIds([event.params.id]);
    let token = getListFromContractData(event.params.id, rawArtifact)
    token.sellerAddress = event.params.seller.toHexString()
    token.price = event.params.price
    token.round = '0.6 round 4'
    token.listedAtTimestamp = event.block.timestamp
    token.save()

}

export function handleUnlisted(event: Unlisted): void {
    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    store.remove('CurrentListing',id)
}
