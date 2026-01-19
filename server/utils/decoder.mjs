import crypto from "crypto";

const SECRET = "12345678901234567890123456789012";

if (!SECRET) {
  throw new Error("ENCRYPTION_SECRET is not set in environment variables");
}

const key = crypto.createHash("sha256").update(SECRET).digest();

const encrypt = (data) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-ctr", key, iv);
  const encrypted =
    cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex");

  return {
    iv: iv.toString("hex"),
    data: encrypted,
  };
};

export default encrypt;
