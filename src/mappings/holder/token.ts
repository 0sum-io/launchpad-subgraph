import { BigDecimal, Bytes, ethereum } from '@graphprotocol/graph-ts'

import { Pool, Token, TransferEvent } from '../../types/schema'
import { Transfer } from '../../types/templates/StandardToken/ERC20'
import { convertTokenToDecimal } from '../../utils'
import {
  decreaseAccountBalance,
  getOrCreateAccount,
  increaseAccountBalance,
  saveAccountBalanceSnapshot,
} from './account'
import { Swap as SwapEvent } from '../../types/templates/Pool/Pool'
import { ZERO } from '../../utils/number'

export function handleSwapForBalance(event: SwapEvent): void {
  const pool = Pool.load(event.address.toHexString())!
  if (pool == null) {
    return
  }
  const token0 = Token.load(pool.token0)
  if (token0 != null) {
    const sourceAccount = getOrCreateAccount(event.params.recipient)
    const accountBalance = event.params.amount0.gt(ZERO)
      ? increaseAccountBalance(sourceAccount, token0, event.params.amount0.abs().toBigDecimal())
      : decreaseAccountBalance(sourceAccount, token0, event.params.amount0.abs().toBigDecimal())
    accountBalance.block = event.block.number
    accountBalance.modified = event.block.timestamp
    accountBalance.transaction = event.transaction.hash
    sourceAccount.save()
    accountBalance.save()
  }

  const token1 = Token.load(pool.token1)
  if (token1 != null) {
    const sourceAccount = getOrCreateAccount(event.params.recipient)
    const accountBalance = event.params.amount1.gt(ZERO)
      ? increaseAccountBalance(sourceAccount, token1, event.params.amount1.abs().toBigDecimal())
      : decreaseAccountBalance(sourceAccount, token1, event.params.amount1.abs().toBigDecimal())
    accountBalance.block = event.block.number
    accountBalance.modified = event.block.timestamp
    accountBalance.transaction = event.transaction.hash
    sourceAccount.save()
    accountBalance.save()
  }
}

export function handleTransfer(event: Transfer): void {
  const token = Token.load(event.address.toHex())

  if (token != null) {
    const amount = convertTokenToDecimal(event.params.value, token.decimals)

    // Update token event logs
    const eventEntity = handleTransferEvent(token, amount, event.params.from, event.params.to, event)
    const eventEntityId = eventEntity.id

    // Updates balances of accounts
    {
      const sourceAccount = getOrCreateAccount(event.params.from)

      const accountBalance = decreaseAccountBalance(sourceAccount, token as Token, amount)
      accountBalance.block = event.block.number
      accountBalance.modified = event.block.timestamp
      accountBalance.transaction = event.transaction.hash

      sourceAccount.save()
      accountBalance.save()

      // To provide information about evolution of account balances
      saveAccountBalanceSnapshot(accountBalance, eventEntityId, event)
    }

    {
      const destinationAccount = getOrCreateAccount(event.params.to)

      const accountBalance = increaseAccountBalance(destinationAccount, token as Token, amount)
      accountBalance.block = event.block.number
      accountBalance.modified = event.block.timestamp
      accountBalance.transaction = event.transaction.hash

      destinationAccount.save()
      accountBalance.save()

      // To provide information about evolution of account balances
      saveAccountBalanceSnapshot(accountBalance, eventEntityId, event)
    }
  }
}

function handleTransferEvent(
  token: Token | null,
  amount: BigDecimal,
  source: Bytes,
  destination: Bytes,
  event: ethereum.Event,
): TransferEvent {
  const transferEvent = new TransferEvent(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
  transferEvent.token = event.address.toHex()
  transferEvent.amount = amount
  transferEvent.sender = source
  transferEvent.source = source
  transferEvent.destination = destination

  transferEvent.block = event.block.number
  transferEvent.timestamp = event.block.timestamp
  transferEvent.transaction = event.transaction.hash

  transferEvent.save()

  return transferEvent
}
