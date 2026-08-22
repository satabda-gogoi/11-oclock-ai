import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.DATABASE_ENCRYPTION_KEY; 
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // Standard initialization vector length for GCM

/**
 * Encrypts a plain object or string using AES-256-GCM
 * @param {Object|String} data - The data payload to secure
 * @returns {Object} Structured package containing hex strings
 */
export const encrypt = (data) => {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Cryptographic Error: Invalid or missing 32-byte hex DATABASE_ENCRYPTION_KEY.');
  }

  const stringifiedData = typeof data === 'object' ? JSON.stringify(data) : data;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(stringifiedData, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // Auth Tag guarantees integrity—prevents malicious modifications to the encrypted string
  const authTag = cipher.getAuthTag().toString('hex');

  return {
    encryptedData: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
};

/**
 * Decrypts an AES-256-GCM package back to its original state
 * @param {String} encryptedData - Hex ciphertext
 * @param {String} iv - Hex initialization vector
 * @param {String} authTag - Hex authentication tag
 * @param {Boolean} isObject - Whether the output should be parsed back to JSON
 */
export const decrypt = (encryptedData, iv, authTag, isObject = true) => {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 64) {
    throw new Error('Cryptographic Error: Invalid or missing 32-byte hex DATABASE_ENCRYPTION_KEY.');
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return isObject ? JSON.parse(decrypted) : decrypted;
};