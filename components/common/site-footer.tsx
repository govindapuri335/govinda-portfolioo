import Link from "next/link";
import * as React from "react";

import { Icons } from "@/components/common/icons";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const footerLinks = [
    {
      name: "LinkedIn",
      href: siteConfig.links.linkedin,
      Icon: Icons.linkedin,
    },
    {
      name: "Email",
      href: siteConfig.links.email,
      Icon: Icons.gmail,
    },
  ];

  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-center gap-4 mt-10 py-10 md:h-24">
        <div className="flex items-center gap-2">
          {footerLinks.map(({ name, href, Icon }) => {
            const isMail = href.startsWith("mailto:");

            return (
              <Link
                key={name}
                href={href}
                target={isMail ? undefined : "_blank"}
                rel={isMail ? undefined : "noopener noreferrer"}
                aria-label={name}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "h-10 w-10 p-2"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
