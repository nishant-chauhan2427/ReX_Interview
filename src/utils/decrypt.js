import CryptoJS from "crypto-js";

const SECRET_KEY = "cF0aBBcfBfO3eMrRC_XrZbqNJVc0JWFs";  
const IV = "n33TnXUdCEgj-J0n";                        

export function decryptValue(encryptedText) {

  const decodedUrl = decodeURIComponent(encryptedText);

  const base64 = decodedUrl.replace(/-/g, '+').replace(/_/g, '/');

  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);

  const decrypted = CryptoJS.AES.decrypt(
    { ciphertext: CryptoJS.enc.Base64.parse(base64) },
    key,
    {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  return decrypted.toString(CryptoJS.enc.Utf8);
}