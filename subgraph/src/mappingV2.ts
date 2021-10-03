import { store } from '@graphprotocol/graph-ts'
import { Sale, Listed, Unlisted } from '../generated/MarketEvents/MarketEvents'
import { ListedToken06R4, TokenSale} from '../generated/schema'


export function handleSale(event: Sale): void {
    let id = event.params.id.toHexString()
    let x = event.transaction.hash.toHex() + "-" + event.logIndex.toString()
    let sale = new TokenSale(x)
    sale.price = (store.get('ListedToken06R4',id) as ListedToken06R4).price
    sale.tokenID = event.params.id
    sale.round = '0.6 round 4'
    sale.save()
    store.remove('ListedToken06R4',id)
}

export function handleListed(event: Listed): void {
    let id = event.params.id.toHexString()
    let token = new ListedToken06R4(id);
    token.tokenID = event.params.id
    token.owner = event.params.seller.toHexString()
    token.price = event.params.price
    token.save()

}

export function handleUnlisted(event: Unlisted): void {
    let id = event.params.id.toHexString()
    store.remove('ListedToken06R4',id)
}

  