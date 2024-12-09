import { PresaleCreated } from '../types/PresaleManager/PresaleManager'
import { Presale } from '../types/schema'

export function handlePresaleCreated(event: PresaleCreated): void {
  handlePresaleCreatedHelper(event)
}

// Exported for unit tests
export function handlePresaleCreatedHelper(event: PresaleCreated): void {
  // load factory
  let presale = Presale.load(event.params.pairAddress.toHex())
  if (presale === null) {
    presale = new Presale(event.address.toHex())
    presale.blockNumber = event.block.number
    presale.blockTimestamp = event.block.timestamp
    presale.data = event.params.data
    presale.id = event.params.pairAddress.toHex()
    presale.name = event.params.name
    presale.pairAddress = event.params.pairAddress.toHex()
    presale.paymentToken = event.params.paymentToken.toHex()
    presale.saleAmount = event.params.saleAmount
    presale.presaleAmount = event.params.presaleAmount
    presale.symbol = event.params.symbol
    presale.token = event.params.token.toHex()
    presale.totalSupply = event.params.totalSupply
    presale.transactionHash = event.transaction.hash.toHex()
    presale.minter = event.transaction.from.toHex()
    presale.isEnd = false
  }

  presale.save()
}
