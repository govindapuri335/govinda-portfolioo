import { ThemeProvider } from "@/components/common/theme-provider";

export const metadata = {
  title: { default: "Admin", template: "%s | Admin" },
  robots: { index: false, follow: false },
};

// Admin pages are dynamic (session-dependent) and should never be cached.
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      themes={[
        "light",
        "dark",
        "retro",
        "cyberpunk",
        "paper",
        "aurora",
        "synthwave",
      ]}
    >
      {children}
    </ThemeProvider>
  );
}
