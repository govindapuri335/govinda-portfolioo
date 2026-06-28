import { Icons } from "@/components/common/icons";

interface SocialInterface {
  name: string;
  username: string;
  icon: any;
  link: string;
}

export const SocialLinks: SocialInterface[] = [
  {
    name: "Github",
    username: "@Krishna8665",
    icon: Icons.gitHub,
    link: "https://github.com/Krishna8665",
  },
  {
    name: "LinkedIn",
    username: "Krishna Khatri",
    icon: Icons.linkedin,
    link: "https://www.linkedin.com/in/krishna-khatri-658415378/",
  },
  {
    name: "Gmail",
    username: "khatrikrissna11",
    icon: Icons.gmail,
    link: "mailto:khatrikrissna11@gmail.com",
  },
  {
    name: "WhatsApp",
    username: "+977 9816115854",
    icon: Icons.whatsapp,
    link: "https://wa.me/9779816115854",
  },
];
