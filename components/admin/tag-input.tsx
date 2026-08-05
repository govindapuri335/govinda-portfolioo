"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = "Add a tag and press Enter",
}: Props) {
  const [draft, setDraft] = useState("");

  function commit() {
    const t = draft.trim();
    if (!t) return;
    if (value.includes(t)) {
      setDraft("");
      return;
    }
    if (value.length >= 20) return;
    onChange([...value, t]);
    setDraft("");
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Tags</label>
      <div
        className={cn(
          "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 min-h-10"
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              aria-label={`Remove ${tag}`}
              className="opacity-70 hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            } else if (e.key === "Backspace" && !draft && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={commit}
          placeholder={placeholder}
          className="border-0 h-7 flex-1 min-w-[140px] focus-visible:ring-0 shadow-none px-1"
        />
      </div>
    </div>
  );
}
