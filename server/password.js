import crypto from 'crypto';

const HASH_ALGORITHM = 'sha256';
const HASH_ITERATIONS = 310000;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;

export function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(password, salt, HASH_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM).toString('hex');
  return `pbkdf2_sha256$${HASH_ITERATIONS}$${salt}$${derivedKey}`;
}

export function verifyPassword(password, storedPassword) {
  if (typeof storedPassword !== 'string') {
    return false;
  }

  const parts = storedPassword.split('$');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2_sha256') {
    return password === storedPassword;
  }

  const [, iterationsStr, salt, hash] = parts;
  const iterations = Number(iterationsStr);
  if (!iterations || !salt || !hash) {
    return false;
  }

  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, HASH_ALGORITHM).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(derivedKey, 'hex'), Buffer.from(hash, 'hex'));
}

export function isHashedPassword(password) {
  return typeof password === 'string' && password.startsWith('pbkdf2_sha256$');
}
