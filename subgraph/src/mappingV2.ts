import { store, Address } from "@graphprotocol/graph-ts";
import { Sale, Listed, Unlisted } from '../generated/MarketEvents/MarketEvents'
import { CurrentListing } from '../generated/schema'
import { GETTERS_CONTRACT_ADDRESS } from '@darkforest_eth/contracts';
import { DarkForestGetters } from '../generated/DarkForestCore/DarkForestGetters';
import { getListFromContractData, getSaleFromContractData } from './helpers/decoders';
import { hexStringToPaddedUnprefixed } from "./helpers/converters";

export function handleSale(event: Sale): void {

    const getters = DarkForestGetters.bind(Address.fromString(GETTERS_CONTRACT_ADDRESS));
    const rawArtifact = getters.bulkGetArtifactsByIds([event.params.id]);

    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    let x = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let sale = getSaleFromContractData(x,rawArtifact[0])
    sale.price = CurrentListing.load(id).price
    sale.round = '0.6 round 4'
    sale.soldAtTimestamp = event.block.timestamp
    sale.buyerAddress = event.params.buyer.toHexString()
    sale.save()
    store.remove('CurrentListing',id)
}

export function handleListed(event: Listed): void {

    const getters = DarkForestGetters.bind(Address.fromString(GETTERS_CONTRACT_ADDRESS));
    const rawArtifact = getters.bulkGetArtifactsByIds([event.params.id]);

    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    let token = new CurrentListing(id);
    getListFromContractData(event.params.id, rawArtifact[0])
    token.sellerAddress = event.params.seller.toHexString()
    token.price = event.params.price
    token.round = '0.6 round 4'
    token.save()

}

export function handleUnlisted(event: Unlisted): void {
    let id = hexStringToPaddedUnprefixed(event.params.id.toHexString())
    store.remove('CurrentListing',id)
}

  