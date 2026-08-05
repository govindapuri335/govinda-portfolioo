import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/session";

import { LoginForm } from "./login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ next?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  if (await isAuthenticated()) {
    redirect(next && next.startsWith("/admin") ? next : "/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-3xl mb-2">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Enter the password to manage blog posts.
          </p>
        </div>
        <LoginForm next={next} />
      </div>
    </div>
  );
}
