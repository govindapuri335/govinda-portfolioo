import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Krishna Khatri — Computer Engineer & Web Developer",
    short_name: "Krishna Khatri",
    description:
      "Krishna Khatri — Computer Engineer and Web Developer building web applications and exploring AI.",
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
      "developer",
      "web development",
      "software engineering",
    ],
    lang: "en",
    dir: "ltr",
    scope: "/",
  };
}
