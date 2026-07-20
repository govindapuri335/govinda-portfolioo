import Link from "next/link";
import * as React from "react";

import { buttonVariants } from "@/components/ui/button";
import CustomTooltip from "@/components/ui/custom-tooltip";
import { SocialLinks } from "@/config/socials";
import { cn } from "@/lib/utils";

export function SiteFooter({ className }: React.HTMLAttributes<HTMLElement>) {
  const linkedIn = SocialLinks.find((item) => item.name === "LinkedIn");
  const LinkedInIcon = linkedIn?.icon;

  return (
    <footer className={cn(className)}>
      <div className="container flex flex-col items-center justify-center gap-4 mt-10 py-10 md:h-24">
        <p className="text-sm text-muted-foreground text-center">
          © 2026 Govinda. All rights reserved.
        </p>
        {linkedIn && LinkedInIcon ? (
          <CustomTooltip icon={linkedIn.icon} text={linkedIn.username}>
            <Link
              href={linkedIn.link}
              target="_blank"
              className={cn(
                buttonVariants({
                  variant: "ghost",
                  size: "sm",
                }),
                "h-10 w-10 p-2"
              )}
            >
              <LinkedInIcon className="h-5 w-5" />
            </Link>
          </CustomTooltip>
        ) : null}
      </div>
    </footer>
  );
}
