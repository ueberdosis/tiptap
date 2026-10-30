import * as sha256 from 'lib0/hash/sha256'
import * as buf from 'lib0/buffer'
const foldDigest = (digest: Uint8Array<ArrayBufferLike>) => {
  const hashBytes = 6
  for (let i = hashBytes; i < digest.length; i++) {
    digest[i % hashBytes] = digest[i % hashBytes] ^ digest[i]
  }
  return digest.slice(0, hashBytes)
}
export const hashOfJSON = (json: unknown) =>
  buf.toBase64(foldDigest(sha256.digest(buf.encodeAny(json))))
