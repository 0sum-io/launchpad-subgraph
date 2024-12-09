import { BigDecimal, Bytes, ethereum } from '@graphprotocol/graph-ts'

import { Account, AccountBalance, AccountBalanceSnapshot, Token } from '../../types/schema'
import { ZERO } from '../../utils/number'

export function getOrCreateAccount(accountAddress: Bytes): Account {
  const accountId = accountAddress.toHex()
  const existingAccount = Account.load(accountId)

  if (existingAccount != null) {
    return existingAccount as Account
  }

  const newAccount = new Account(accountId)
  newAccount.address = accountAddress

  return newAccount
}

function getOrCreateAccountBalance(account: Account, token: Token): AccountBalance {
  const balanceId = account.id + '-' + token.id
  const previousBalance = AccountBalance.load(balanceId)

  if (previousBalance != null) {
    return previousBalance as AccountBalance
  }

  const newBalance = new AccountBalance(balanceId)
  newBalance.account = account.id
  newBalance.token = token.id
  newBalance.amount = ZERO.toBigDecimal()

  return newBalance
}

export function increaseAccountBalance(account: Account, token: Token, amount: BigDecimal): AccountBalance {
  const balance = getOrCreateAccountBalance(account, token)
  balance.amount = balance.amount.plus(amount)

  return balance
}

export function decreaseAccountBalance(account: Account, token: Token, amount: BigDecimal): AccountBalance {
  const balance = getOrCreateAccountBalance(account, token)
  balance.amount = balance.amount.minus(amount)

  return balance
}

export function saveAccountBalanceSnapshot(balance: AccountBalance, eventId: string, event: ethereum.Event): void {
  const snapshot = new AccountBalanceSnapshot(balance.id + '-' + event.block.timestamp.toString())
  snapshot.account = balance.account
  snapshot.token = balance.token
  snapshot.amount = balance.amount

  snapshot.block = event.block.number
  snapshot.transaction = event.transaction.hash
  snapshot.timestamp = event.block.timestamp

  snapshot.event = eventId

  snapshot.save()
}
