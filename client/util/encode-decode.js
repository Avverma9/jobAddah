// src/util/encode-decode.js
export const encodeBase64Url = (str) => {
  if (!str) return "";
  const base64 = btoa(unescape(encodeURIComponent(str)));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const decodeBase64Url = (str) => {
  if (!str) return "";
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4 === 0 ? "" : "=".repeat(4 - (base64.length % 4));
  const result = base64 + pad;
  return decodeURIComponent(escape(atob(result)));
};



import CryptoJS from "crypto-js";

// SAME SECRET JO BACKEND .env me use kar rahe ho
const SECRET =  "12345678901234567890123456789012";; 

export function decryptResponse({ iv, data }) {
  try {
    const key = CryptoJS.SHA256(SECRET);  
    const ivWordArray = CryptoJS.enc.Hex.parse(iv);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: CryptoJS.enc.Hex.parse(data) },
      key,
      {
        iv: ivWordArray,
        mode: CryptoJS.mode.CTR,
        padding: CryptoJS.pad.NoPadding,
      }
    );

    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);

    return JSON.parse(jsonString);
  } catch (error) {
    console.error("❌ Decryption failed:", error);
    return null;
  }
}

export const parseApiResponse = async (res) => {
  const json = await res.json();
  if (json && json.iv && json.data) return decryptResponse(json);
  return json;
};