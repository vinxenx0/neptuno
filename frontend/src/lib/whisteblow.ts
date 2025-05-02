// frontend/src/lib/whistleblow.ts
import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!.padEnd(32); // Must be 32 chars for AES-256
const IV = crypto.randomBytes(16);

function encrypt(text: string) {
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), IV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return IV.toString("hex") + ":" + encrypted.toString("hex");
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") return res.status(405).end();

  const form = formidable({ multiples: false, uploadDir: "/tmp", keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Form parse error" });
    }

    const { subject, message, email, anonymous } = fields;
    const trackingId = uuidv4();

    const reportData = {
      subject,
      message,
      email: anonymous === "on" ? null : email,
      trackingId,
      date: new Date().toISOString(),
    };

    // Encrypt message
    const encrypted = encrypt(JSON.stringify(reportData));

    // Handle file
    let attachmentPath = "";
    if (files.attachment) {
      const file = files.attachment[0] ?? files.attachment;
      const savePath = path.join(process.cwd(), "uploads", `${trackingId}_${file.originalFilename}`);
      fs.renameSync(file.filepath, savePath);
      attachmentPath = savePath;
    }

    // Store or email (you can replace this with emailing encrypted content)
    fs.writeFileSync(path.join(process.cwd(), "reports", `${trackingId}.enc`), encrypted);

    return res.status(200).json({ trackingId });
  });
};

export default handler;
