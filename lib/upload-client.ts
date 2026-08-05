export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

interface SignPayload {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  uploadUrl: string;
}

/**
 * Uploads a File directly from the browser to Cloudinary using a signed
 * payload obtained from `/api/admin/upload-sign`. The image bytes never
 * traverse our Next.js server, sidestepping serverless body-size limits.
 */
export async function uploadImageToCloudinary(
  file: File
): Promise<UploadedImage> {
  const signRes = await fetch("/api/admin/upload-sign", { method: "POST" });
  if (!signRes.ok) {
    throw new Error("Failed to obtain upload signature");
  }
  const sign: SignPayload = await signRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", sign.apiKey);
  form.append("timestamp", String(sign.timestamp));
  form.append("signature", sign.signature);
  form.append("folder", sign.folder);

  const res = await fetch(sign.uploadUrl, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return {
    url: data.secure_url as string,
    publicId: data.public_id as string,
    width: data.width as number,
    height: data.height as number,
    format: data.format as string,
    bytes: data.bytes as number,
  };
}
