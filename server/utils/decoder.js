// Backend (Node.js)
const crypto = require("crypto");
const SECRET = "12345678901234567890123456789012";
if (!SECRET) {
  throw new Error("ENCRYPTION_SECRET is not set in environment variables");
}
// 32-byte key banane ke liye sha256 hash use kar rahe hain
const key = crypto.createHash("sha256").update(SECRET).digest(); // 32 bytes
function encrypt(data) {
  const iv = crypto.randomBytes(16); // random IV har request ke liye
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encrypted =
    cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex");
  return {
    iv: iv.toString("hex"),
    data: encrypted, // frontend iss hex ko decrypt karega
  };
}

module.exports = encrypt;
