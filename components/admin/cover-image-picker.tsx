"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { uploadImageToCloudinary } from "@/lib/upload-client";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

export function CoverImagePicker({ value, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setError(null);
      setUploading(true);
      try {
        const uploaded = await uploadImageToCloudinary(file);
        onChange(uploaded.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    };
    input.click();
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Cover image</label>
      {value ? (
        <div className="relative w-full max-w-md aspect-[16/9] overflow-hidden rounded-md border border-border bg-muted">
          <Image
            src={value}
            alt="Cover"
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            className="object-cover"
            unoptimized={!value.includes("res.cloudinary.com")}
          />
        </div>
      ) : (
        <div className="w-full max-w-md aspect-[16/9] rounded-md border border-dashed border-border bg-muted/30 flex items-center justify-center text-sm text-muted-foreground">
          No cover image
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onPick}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
            disabled={uploading}
          >
            Remove
          </Button>
        )}
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
