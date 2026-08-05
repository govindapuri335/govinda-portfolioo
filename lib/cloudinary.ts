import "server-only";

import { v2 as cloudinary } from "cloudinary";

let configured = false;

function configure() {
  if (configured) return;
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET."
    );
  }
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
  configured = true;
}

export interface SignedUpload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
}

/**
 * Produces a signed payload the browser can use to upload directly to
 * Cloudinary without the image bytes ever touching our Next.js server.
 * The signature is scoped to a specific folder + timestamp and is short-lived.
 */
export function signUpload(): SignedUpload {
  configure();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "portfolio/blogs";

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!
  );

  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME!,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    timestamp,
    signature,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  };
}
