import { ValidSkills } from "./constants";

export interface ExperienceInterface {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | "Present";
  description: string[];
  achievements: string[];
  skills: ValidSkills[];
  companyUrl?: string;
  logo?: string;
}

export const experiences: ExperienceInterface[] = [
  {
    id: "digital-pathsala",
    position: "Full Stack Web Development Trainee",
    company: "Digital Pathsala",
    location: "Remote",
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-11-01"),
    description: [
      "Completed intensive training in React.js, Node.js, and Next.js.",
      "Built full-stack applications using MERN stack architecture.",
      "Worked on real-world projects focusing on REST APIs and authentication systems.",
    ],
    achievements: [
      "Successfully completed full-stack web development course (React, Node.js, Next.js).",
      "Built multiple production-ready projects with API integration.",
      "Strengthened backend skills with Express and MongoDB.",
    ],
    skills: ["React", "Node.js", "Next.js", "MongoDB", "Express", "Javascript"],
    companyUrl: "",
    logo: "/experience/digital.png",
  },
  {
    id: "brandbuilder",
    position: "Web Development Intern",
    company: "Brandbuilder",
    location: "Onsite",
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-08-01"),
    description: [
      "Developed responsive web applications using MERN stack.",
      "Collaborated with design and marketing teams to build optimized landing pages.",
      "Integrated third-party APIs and improved performance optimization.",
    ],
    achievements: [
      "Delivered production-ready features used by real clients.",
      "Improved website performance and SEO structure.",
      "Worked in Agile environment with Git-based workflows.",
    ],
    skills: ["React", "Node.js", "MongoDB", "Express", "HTML 5", "CSS 3"],
    companyUrl: "",
    logo: "/experience/brandbuilderCircleLogo.png",
  },
  {
    id: "flowopstech",
    position: "Full Stack Developer",
    company: "FlowOpsTech",
    location: "Hybrid",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2026-01-01"),
    description: [
      "Built a fully dynamic Quiz Application with authentication and admin dashboard.",
      "Designed REST APIs and managed MongoDB database schemas.",
      "Implemented JWT-based authentication and role-based access control.",
    ],
    achievements: [
      "Developed and deployed a fully dynamic Quiz App.",
      "Implemented secure authentication and real-time result tracking.",
      "Optimized backend queries for scalable performance.",
    ],
    skills: ["React", "Node.js", "MongoDB", "Express", "JWT", "Typescript"],
    companyUrl: "",
    logo: "/experience/flowOps.png",
  },
  {
    id: "swift-academy",
    position: "MERN Stack Tutor",
    company: "Swift Academy",
    location: "Onsite",
    startDate: new Date("2025-01-01"),
    endDate: "Present",
    description: [
      "Teaching MERN Stack (MongoDB, Express, React, Node.js) to students.",
      "Conducting live coding sessions and building real-world full-stack projects.",
      "Mentoring students on project architecture and deployment strategies.",
    ],
    achievements: [
      "Successfully mentored multiple students in full-stack development.",
      "Designed structured MERN curriculum from beginner to advanced level.",
      "Guided students in building deployable production-ready applications.",
    ],
    skills: ["React", "Node.js", "MongoDB", "Express", "Typescript"],
    companyUrl: "",
    logo: "/experience/swift.jpg",
  },
];
