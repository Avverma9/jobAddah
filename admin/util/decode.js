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



import api from "./api";

export async function decryptResponse({ iv, data }) {
  try {
    // Delegate decryption to backend which keeps the SECRET in server-side env.
    const res = await api.post("/decrypt", { iv, data });
    return res.data;
  } catch (error) {
    console.error("❌ Decryption via backend failed:", error);
    return null;
  }
}

export const parseApiResponse = async (res) => {
  const json = await res.json();
  if (json && json.iv && json.data) return decryptResponse(json);
  return json;
};