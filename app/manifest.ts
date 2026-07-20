import type { MetadataRoute } from "next";
////
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Govinda Puri",
    short_name: "Govinda Puri",
    description:
      "Govinda Puri — Credit Analyst in Equipment Finance focused on underwriting, lender submissions, and business analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/letterK.jpg?v=2",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/letterK.jpg?v=2",
        sizes: "64x64",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: [
      "portfolio",
      "finance",
      "business",
      "professional",
    ],
    lang: "en",
    dir: "ltr",
    scope: "/",
  };
}
