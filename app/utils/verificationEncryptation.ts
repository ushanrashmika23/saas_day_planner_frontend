/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

const SECRET_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-min-32-chars-long';
const ALGORITHM = 'aes-256-cbc';

// Ensure the key is exactly 32 bytes
const getKey = (): Buffer => {
    // Determine the key based on the environment variable or default
    const key = SECRET_KEY;
    // Create a 32-byte buffer
    const keyBuffer = Buffer.alloc(32);
    // Copy the key into the buffer, respecting the 32-byte limit
    const sourceBuffer = Buffer.from(key);
    sourceBuffer.copy(keyBuffer, 0, 0, Math.min(keyBuffer.length, sourceBuffer.length));
    return keyBuffer;
};

export function encode(data: any): string {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ALGORITHM, getKey(), iv);

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return iv.toString('hex') + ':' + encrypted;
}

export function decode<T = any>(encryptedData: string): T {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const decipher = createDecipheriv(ALGORITHM, getKey(), iv);

    let decrypted = decipher.update(parts[1], 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
}

const encryptionUtils = { encode, decode };
export default encryptionUtils;