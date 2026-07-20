"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { useState } from "react";
import { SocialLinks } from "@/config/socials";

export default function SocialLinksCard() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="w-full h-fit max-w-sm overflow-hidden shadow-lg transition-all duration-300 ease-in-out transform hover:scale-102 mt-5"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-8 flex flex-col items-center text-center">
        <div className="mb-6">
          <Heart
            className={`w-12 h-12 transition-colors duration-300 ease-out ${
              isHovered ? "text-red-500" : "text-muted-foreground"
            }`}
          />
        </div>
        <h2 className="font-heading text-xl tracking-tight lg:text-3xl duration-300">
          Connect with me
        </h2>
        <p className="mt-2 mb-4 font-heading text-lg text-muted-foreground">
          Reach out on LinkedIn or email:
        </p>
        <div className="flex flex-col items-start space-y-3">
          {SocialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <a
                key={social.name}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-lg font-medium text-primary hover:underline"
              >
                <Icon className="w-5 h-5" />
                <span>{social.username}</span>
              </a>
            );
          })}
        </div>
      </CardContent>
      <div
        className={`h-1 bg-gradient-to-r from-red-500 to-red-500 transition-all duration-300 ease-out ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      ></div>
    </Card>
  );
}
