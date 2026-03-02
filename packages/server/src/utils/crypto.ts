// ──────────────────────────────────────────────
// Utility: API Key Encryption
// ──────────────────────────────────────────────
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    // In development, use a deterministic (insecure!) key
    return Buffer.alloc(32, "dev-key-do-not-use-in-production!");
  }
  return Buffer.from(key, "hex");
}

/** Encrypt a plaintext API key. Returns "iv:encrypted:authTag" in hex. */
export function encryptApiKey(plaintext: string): string {
  if (!plaintext) return "";
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${encrypted}:${authTag}`;
}

/** Decrypt an encrypted API key string. */
export function decryptApiKey(encrypted: string): string {
  if (!encrypted) return "";
  const key = getEncryptionKey();
  const [ivHex, encHex, authTagHex] = encrypted.split(":");
  if (!ivHex || !encHex || !authTagHex) return "";
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
