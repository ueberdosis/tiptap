export interface TransactionSource {
  transact(callback: () => void, origin?: unknown): unknown
}
