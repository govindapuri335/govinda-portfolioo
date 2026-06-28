import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // trim because .env entries sometimes include stray spaces
  let formLink = process.env.GOOGLE_FORM_LINK?.trim();
  if (!formLink) {
    return new NextResponse("Please configure the env variables", {
      status: 500,
    });
  }

  // Google form URLs are typically the "viewform" version, possibly with
  // query parameters (`?usp=...`). we need to convert that to a clean
  // `/formResponse` endpoint.  The logic below strips any search/query string
  // and removes trailing `/viewform` or `/formResponse` segments so we can
  // append `/formResponse` ourselves.
  try {
    const u = new URL(formLink);
    u.search = ""; // drop query params
    u.hash = "";
    u.pathname = u.pathname.replace(/\/(viewform|formResponse)(?:\/.*)?$/, "");
    // remove trailing slash as well
    formLink = u.toString().replace(/\/+$/, "");
  } catch {
    // if parsing fails, just leave formLink as-is; fetch will error later
  }

  // configure this according to your google form; each value should be the
  // `entry.xxxxxx` identifier for the corresponding question.
  const fieldIdName = process.env.GOOGLE_FORM_FIELD_ID_NAME;
  const fieldIdEmail = process.env.GOOGLE_FORM_FIELD_ID_EMAIL;
  const fieldIdMessage = process.env.GOOGLE_FORM_FIELD_ID_MESSAGE;
  const fieldIdSocial = process.env.GOOGLE_FORM_FIELD_ID_SOCIAL;

  if (!fieldIdName || !fieldIdEmail || !fieldIdMessage) {
    return new NextResponse("Form field IDs are not configured properly", {
      status: 500,
    });
  }

  // warn if any of the configured IDs are identical, because that usually
  // indicates the user forgot to set real values (the placeholder
  // `entry_field_id_gform` is used in .env.copy).  Google will then receive
  // multiple values for the same question which may be silently dropped.
  const ids = [fieldIdName, fieldIdEmail, fieldIdMessage, fieldIdSocial].filter(
    Boolean
  );
  const unique = new Set(ids);
  if (unique.size !== ids.length) {
    console.warn("Some GOOGLE_FORM_FIELD_ID_* values are duplicates", ids);
  }

  try {
    const body = await req.json();
    const { name, message, social, socials, email } = body as any;

    // build query parameters with proper URL encoding
    const params = new URLSearchParams();
    if (fieldIdName) params.append(fieldIdName.trim(), name);
    if (fieldIdEmail) params.append(fieldIdEmail.trim(), email);
    if (fieldIdMessage) params.append(fieldIdMessage.trim(), message);
    if (fieldIdSocial) {
      let socialValue = "";
      if (socials && Array.isArray(socials)) {
        // convert array of {platform,value} to newline-separated string
        socialValue = socials
          .map((s: any) => {
            const plat = s.platform ? `${s.platform}: ` : "";
            return plat + (s.value || "");
          })
          .filter((s: string) => s.trim() !== "")
          .join("\n");
      } else if (social) {
        socialValue = social;
      }
      if (socialValue) {
        params.append(fieldIdSocial.trim(), socialValue);
      }
    }

    // some google forms include the /viewform path in the link; submit via /formResponse
    const submitUrl = `${formLink}/formResponse?${params.toString()}`;
    console.log("submitting contact form to", submitUrl);

    const res = await fetch(submitUrl);
    if (!res.ok) {
      // log for debugging; google returns 200 or 302 for successful form posts
      console.error("Google form submit failed", res.status, await res.text());
      return new NextResponse("Failed to submit form", { status: 502 });
    }

    return NextResponse.json("Success!");
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
