/**
 * Cryptographic utilities for SHA-256 hashing, Merkle tree construction,
 * ZK-style selective disclosure, and Blockchain evidence anchoring.
 */

export async function sha256(message: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const msgUint8 = new TextEncoder().encode(message);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple deterministic hash if WebCrypto is unavailable
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0;
  }
  return '0x' + Math.abs(hash).toString(16).padStart(64, 'a');
}

export interface MerkleNode {
  hash: string;
  left?: MerkleNode;
  right?: MerkleNode;
}

export async function buildMerkleTree(claims: string[]): Promise<{ root: string; leafHashes: string[] }> {
  if (claims.length === 0) {
    const emptyHash = await sha256('EMPTY_MERKLE_TREE');
    return { root: emptyHash, leafHashes: [emptyHash] };
  }

  // Hash each claim leaf
  const leafHashes = await Promise.all(claims.map(c => sha256(c)));

  let currentLevel = [...leafHashes];
  while (currentLevel.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < currentLevel.length; i += 2) {
      const left = currentLevel[i];
      const right = i + 1 < currentLevel.length ? currentLevel[i + 1] : currentLevel[i];
      const combined = await sha256(left + right);
      nextLevel.push(combined);
    }
    currentLevel = nextLevel;
  }

  return {
    root: currentLevel[0],
    leafHashes,
  };
}

export function generateRandomHex(length: number): string {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}
