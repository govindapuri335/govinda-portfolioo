import { Icons } from "@/components/common/icons";

interface SocialInterface {
  name: string;
  username: string;
  icon: any;
  link: string;
}

export const SocialLinks: SocialInterface[] = [
  {
    name: "LinkedIn",
    username: "linkedin.com/in/govindaspuri",
    icon: Icons.linkedin,
    link: "https://www.linkedin.com/in/govindaspuri",
  },
  {
    name: "Email",
    username: "founder@govindapuri.com",
    icon: Icons.gmail,
    link: "mailto:founder@govindapuri.com",
  },
];
