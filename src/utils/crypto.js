import CryptoJS from 'crypto-js';

export const generateKey = () => {
  return CryptoJS.lib.WordArray.random(256/8).toString();
};

export const encryptFile = (file, key) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();
      resolve(encrypted);
    };
    reader.readAsArrayBuffer(file);
  });
};

export const decryptFile = (encrypted, key, fileName, type) => {
  const decrypted = CryptoJS.AES.decrypt(encrypted, key);
  const typedArray = convertWordArrayToUint8Array(decrypted);
  return new File([typedArray], fileName, { type });
};

export const calculateHash = (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      const hash = CryptoJS.SHA256(wordArray).toString();
      resolve(hash);
    };
    reader.readAsArrayBuffer(file);
  });
};

const convertWordArrayToUint8Array = (wordArray) => {
  const arrayOfWords = wordArray.hasOwnProperty("words") ? wordArray.words : [];
  const length = wordArray.hasOwnProperty("sigBytes") ? wordArray.sigBytes : arrayOfWords.length * 4;
  const uInt8Array = new Uint8Array(length);
  let index = 0;
  
  for (let i = 0; i < length; i++) {
    const byte = (arrayOfWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
    uInt8Array[index++] = byte;
  }
  
  return uInt8Array;
};