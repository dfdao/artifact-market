import { store } from '@graphprotocol/graph-ts'
import { Sale, Listed, Unlisted } from '../generated/MarketEvents/MarketEvents'
import { ListedToken06r4 } from '../generated/schema'


export function handleSale(event: Sale): void {
    let id = event.params.id.toHexString()
    store.remove('ListedToken06r4',id)
}

export function handleListed(event: Listed): void {
    let id = event.params.id.toHexString()
    let token = new ListedToken06r4(id);
    token.tokenID = event.params.id
    token.owner = event.params.seller.toHexString()
    token.price = event.params.price
    token.save()

}

export function handleUnlisted(event: Unlisted): void {
    let id = event.params.id.toHexString()
    store.remove('ListedToken06r4',id)
}

  