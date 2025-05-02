import type { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!.padEnd(32);

function decrypt(encryptedText: string) {
  const [ivHex, encryptedHex] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { trackingId } = req.query;

  if (!trackingId || typeof trackingId !== "string") {
    return res.status(400).json({ error: "Invalid tracking ID" });
  }

  const filePath = path.join(process.cwd(), "reports", `${trackingId}.enc`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "Report not found" });
  }

  try {
    const encrypted = fs.readFileSync(filePath, "utf-8");
    const decrypted = decrypt(encrypted);
    const data = JSON.parse(decrypted);

    // Optional: Limit info exposed here
    const { subject, date, email } = data;

    res.status(200).json({ subject, date, email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read or decrypt report" });
  }
}
