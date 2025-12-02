import CryptoJS from 'crypto-js'

/** 加密密钥，生产环境应从环境变量读取 */
const SECRET_KEY = import.meta.env.VITE_CRYPTO_SECRET_KEY || 'default-secret-key-32bytes!!'

/**
 * 使用 AES 加密密码
 * @param password 原始密码
 * @returns 加密后的密码字符串
 */
export function encryptPassword(password: string): string {
  return CryptoJS.AES.encrypt(password, SECRET_KEY).toString()
}

/**
 * 使用 MD5 哈希密码
 * @param password 原始密码
 * @returns MD5 哈希后的密码字符串
 */
export function hashPassword(password: string): string {
  return CryptoJS.MD5(password).toString()
}

/**
 * 使用 SHA256 哈希密码
 * @param password 原始密码
 * @returns SHA256 哈希后的密码字符串
 */
export function hashPasswordSHA256(password: string): string {
  return CryptoJS.SHA256(password).toString()
}
