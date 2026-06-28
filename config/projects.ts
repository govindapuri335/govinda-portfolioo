import { ValidCategory, ValidExpType, ValidSkills } from "./constants";
//
interface PagesInfoInterface {
  title: string;
  imgArr: string[];
  description?: string;
}

interface DescriptionDetailsInterface {
  paragraphs: string[];
  bullets: string[];
}

export interface ProjectInterface {
  id: string;
  type: ValidExpType;
  companyName: string;
  category: ValidCategory[];
  shortDescription: string;
  websiteLink?: string;
  githubLink?: string;
  techStack: ValidSkills[];
  startDate: Date;
  endDate: Date;
  // path to a logo/image; should be a string referencing a public asset or imported file
  companyLogoImg: string;
  descriptionDetails: DescriptionDetailsInterface;
  pagesInfoArr: PagesInfoInterface[];
}

export const Projects: ProjectInterface[] = [
  {
    id: "worst-gpt",
    companyName: "WorstGPT",
    type: "Professional",
    category: ["Full Stack", "AI", "Web Dev"],
    shortDescription:
      "A tongue-in-cheek AI chatbot that responds with sarcastic, brutally honest replies. Built with a credit-based freemium system and AI-powered conversations.",
    websiteLink: "https://worstgpt.vercel.app",
    githubLink: "https://github.com/Krishna8665/worstgpt",
    techStack: [
      "React",
      "Vite",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Typescript",
      "Tailwind CSS",
      "Stripe",
    ],
    startDate: new Date("2025-06-01"),
    endDate: new Date("2025-08-01"),
    companyLogoImg: "/projects/worstgpt/homepage.png",
    pagesInfoArr: [
      {
        title: "Landing Page",
        description:
          "Modern landing page introducing the sarcastic AI chatbot with features, pricing plans, and product highlights.",
        imgArr: ["/projects/worstgpt/homepage.png"],
      },
      {
        title: "Chat Interface",
        description:
          "Real-time chat interface where users interact with the AI chatbot and receive sarcastic responses.",
        // chat screenshot not available yet, reuse homepage
        imgArr: ["/projects/worstgpt/homepage.png"],
      },
      {
        title: "Authentication System",
        description:
          "Secure authentication system with JWT and Google OAuth for seamless user login and account management.",
        imgArr: ["/projects/worstgpt/authentication.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "WorstGPT is a full-stack AI chatbot platform designed to provide humorous and sarcastic responses instead of traditional polite AI replies. The project explores character-driven AI interaction by creating a chatbot personality that delivers brutally honest and entertaining conversations.",

        "The platform is built with a modern full-stack architecture using React and Vite for the frontend and Node.js with Express for the backend. MongoDB manages user accounts, chat usage tracking, and conversation data while Deepseek V3 API powers the AI responses.",

        "To support scalability and monetization, the platform implements a credit-based freemium system where free users receive limited message credits and premium users gain extended access. Stripe subscription integration manages recurring payments, while webhook events automatically update premium user status.",

        "The application also includes JWT authentication, Google OAuth login, API rate limiting, and a usage tracking system that deducts credits based on token usage. Automated cron jobs reset credits monthly to ensure fair usage across the platform.",
      ],
      bullets: [
        "Developed a full-stack AI chatbot platform using React, Node.js, Express, and MongoDB.",
        "Integrated Deepseek V3 API to generate sarcastic and personality-driven AI responses.",
        "Implemented a credit-based freemium system to control AI usage.",
        "Built Stripe subscription integration with webhook-based premium upgrades.",
        "Created JWT authentication with Google OAuth and email login support.",
        "Developed a usage tracking system that deducts credits based on token consumption.",
        "Implemented API rate limiting to prevent abuse and maintain platform stability.",
        "Built cron jobs to automatically reset monthly credits for users.",
      ],
    },
  },
  {
    id: "quiz-app",
    companyName: "Interactive Quiz App",
    type: "Professional",
    category: ["Full Stack", "Web Dev"],
    shortDescription:
      "A full-stack quiz management platform where users can create quizzes, participate in category-based tests, track results, and manage quiz content through an interactive dashboard.",
    githubLink: "https://github.com/Krishna8665/quiz-app",
    techStack: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JavaScript",
      "Tailwind CSS",
    ],
    startDate: new Date("2024-12-01"),
    endDate: new Date("2025-02-01"),
    companyLogoImg: "/projects/quiz/search.jpeg",
    pagesInfoArr: [
      {
        title: "Dashboard",
        description:
          "Central dashboard where users can access quizzes, view available categories, and navigate to different quiz management features.",
        imgArr: ["/projects/quiz/dashboard.jpeg"],
      },
      {
        title: "Create Quiz",
        description:
          "Interface that allows users to create custom quizzes by adding questions, options, and correct answers for different categories.",
        imgArr: ["/projects/quiz/createQuiz.jpeg"],
      },
      {
        title: "Manage Quiz",
        description:
          "Quiz management panel where users can edit, update, or delete previously created quizzes and manage quiz content efficiently.",
        imgArr: ["/projects/quiz/manageQuizzes.jpeg"],
      },
      {
        title: "Quiz History",
        description:
          "History section that tracks completed quizzes, displaying scores, attempts, and performance insights for each user.",
        imgArr: ["/projects/quiz/quizHistory.jpeg"],
      },
      {
        title: "Quiz Search",
        description:
          "Search interface where users can quickly find quizzes by entering keywords or selecting categories. This feature helps users discover quizzes relevant to their interests.",
        imgArr: ["/projects/quiz/search.jpeg"],
      },
      {
        title: "Buzzer Round",
        description:
          "Interactive buzzer round interface where participants compete to answer questions first by pressing the buzzer, creating a real-time competitive quiz experience.",
        imgArr: ["/projects/quiz/teamBuzzer.jpeg"],
      },
      {
        title: "Buzzer Round Question",
        description:
          "Question display screen for the buzzer round showing the quiz question and allowing players to submit answers after buzzing in.",
        imgArr: ["/projects/quiz/buzzerQuestion.jpeg"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "The Interactive Quiz App is a full-stack web platform designed to provide an engaging environment for creating and participating in quizzes. The application enables users not only to attempt quizzes but also to build and manage their own quiz content through an intuitive interface.",

        "The system is developed using React for the frontend and Node.js with Express for the backend, while MongoDB is used to store quiz questions, categories, user attempts, and performance data. This architecture ensures efficient data handling and scalable quiz management.",

        "Users can create quizzes by adding multiple-choice questions, defining correct answers, and organizing them into categories. The platform dynamically loads questions during quiz sessions and automatically evaluates responses to generate real-time scores.",

        "The application also includes quiz management and history tracking features, allowing users to monitor their past attempts, review results, and improve their performance over time while maintaining a responsive and user-friendly interface across devices.",
      ],
      bullets: [
        "Developed a full-stack quiz platform using React, Node.js, Express, and MongoDB.",
        "Implemented quiz creation functionality with customizable questions and answers.",
        "Built a quiz management system for editing and maintaining quiz content.",
        "Designed a responsive dashboard for navigating quizzes and user activities.",
        "Implemented automatic scoring and real-time answer validation.",
        "Developed quiz history tracking to store user attempts and performance.",
        "Created RESTful APIs for quiz creation, management, and result tracking.",
        "Optimized database queries for faster quiz loading and result processing.",
      ],
    },
  },
  {
    id: "workhub",
    companyName: "WorkHub",
    type: "Personal",
    category: ["Full Stack", "Web Dev", "AI"],
    shortDescription:
      "A freelancing marketplace that lets users play buyer or seller, create gigs, and explore services with AI-powered recommendations – inspired by Fiverr.",
    githubLink: "https://github.com/Krishna8665/workhub",
    techStack: [
      "React",
      "TypeScript",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Python",
      "Tailwind CSS",
    ],
    startDate: new Date("2025-02-01"),
    endDate: new Date("2025-04-01"),
    companyLogoImg: "/projects/workhub/workhub.png",
    pagesInfoArr: [
      {
        title: "Marketplace Overview",
        description:
          "Main marketplace interface displaying available gigs and services where buyers can browse different categories and explore services offered by freelancers.",
        imgArr: ["/projects/workhub/workhub.png"],
      },
      {
        title: "User Login",
        description:
          "Secure login system allowing users to access their accounts to manage gigs, place orders, and interact with other users on the platform.",
        imgArr: ["/projects/workhub/login.png"],
      },
      {
        title: "User Registration & Become Seller",
        description:
          "Registration page where users can create an account and optionally enable the 'Become a Seller' feature to start offering services and publish gigs on the marketplace.",
        imgArr: ["/projects/workhub/register.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "WorkHub is a full-stack freelancing marketplace designed to connect freelancers with clients looking for digital services. Inspired by platforms like Fiverr, the application allows users to either hire freelancers as buyers or offer services as sellers within a unified platform.",

        "The platform is built using a modern full-stack architecture with React and TypeScript for the frontend and Node.js with Express for the backend. MongoDB is used for managing user accounts, gig listings, and marketplace data, providing scalable and efficient data storage.",

        "Sellers can create and manage gigs by adding service descriptions, pricing tiers, and category tags, while buyers can browse available services, view gig details, and select freelancers that best match their needs.",

        "To enhance user experience and discovery, the platform integrates an AI-based recommendation system developed using Python. This system analyzes user behavior and browsing patterns to recommend relevant gigs and services to buyers, helping them find suitable freelancers more efficiently.",
      ],
      bullets: [
        "Developed a full-stack freelancing marketplace using React, TypeScript, Node.js, and MongoDB.",
        "Implemented dual-role functionality allowing users to act as buyers or sellers.",
        "Built a gig creation and management system for freelancers to publish services.",
        "Designed a responsive UI for browsing gigs and discovering freelance services.",
        "Created RESTful APIs for user authentication, gig management, and marketplace operations.",
        "Integrated a Python-based AI recommendation system to suggest relevant gigs.",
        "Implemented secure authentication and user account management.",
        "Optimized database queries for faster gig retrieval and improved performance.",
      ],
    },
  },
  {
    id: "hamrobus",
    companyName: "HamroBus",
    type: "Personal",
    category: ["Full Stack", "Web Dev"],
    shortDescription:
      "An online bus ticket booking platform where users search routes, view schedules, and reserve seats with ease.",
    githubLink: "https://github.com/Krishna8665/hamrobus",
    techStack: [
      "React",
      "Node.js",
      "Express.js",
      "MongoDB",
      "JavaScript",
      "Tailwind CSS",
    ],
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-12-01"),
    companyLogoImg: "/projects/hamrobus/hamrobus.png",
    pagesInfoArr: [
      {
        title: "Homepage",
        description:
          "Main landing page where users can search available buses by selecting their departure location, destination, and travel date.",
        imgArr: ["/projects/hamrobus/hamrobus.png"],
      },
      {
        title: "User Registration",
        description:
          "Registration page that allows new users to create an account in order to book bus tickets, manage reservations, and track travel details.",
        imgArr: ["/projects/hamrobus/reg.png"],
      },
      {
        title: "Bus Information",
        description:
          "Bus information page displaying details such as available routes, departure times, seat availability, and pricing for each bus.",
        imgArr: ["/projects/hamrobus/businfo.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "HamroBus is a full-stack online bus ticket booking system designed to simplify the process of reserving bus seats for travelers. The platform allows users to search available buses, check schedules, and book seats according to their preferred travel time.",

        "The application is built using React for the frontend and Node.js with Express for the backend. MongoDB is used to manage user accounts, bus schedules, and booking data, ensuring efficient storage and retrieval of transportation information.",

        "Users can browse available routes, view detailed bus information including departure times and seat availability, and reserve seats directly through the platform. The system focuses on providing a simple and intuitive user experience for quick ticket booking.",

        "The platform also includes user authentication and booking management features that allow users to register, log in, and manage their travel reservations easily.",
      ],
      bullets: [
        "Developed a full-stack bus ticket booking platform using React, Node.js, Express, and MongoDB.",
        "Implemented bus search functionality based on travel routes and departure times.",
        "Built a seat booking system allowing users to reserve bus seats online.",
        "Created RESTful APIs for managing buses, schedules, and bookings.",
        "Designed a responsive user interface for smooth navigation across devices.",
        "Implemented user authentication for secure account and booking management.",
        "Optimized database queries for efficient bus schedule and seat availability retrieval.",
      ],
    },
  },
  {
    id: "restaurant-website",
    companyName: "Hotel & Restaurant Website",
    type: "Personal",
    category: ["Frontend", "Web Dev"],
    shortDescription:
      "A responsive restaurant website that showcases menu items, location details, and enables customers to easily contact the restaurant via WhatsApp and view its location on Google Maps.",
    githubLink: "https://github.com/yourusername/restaurant-website",
    techStack: [
      "React",
      "JavaScript",
      "Tailwind CSS",
      "Google Maps Embed",
      "WhatsApp API",
    ],
    startDate: new Date("2025-03-01"),
    endDate: new Date("2025-03-15"),
    companyLogoImg: "/projects/restaurant/pandeliHomepage.png",
    pagesInfoArr: [
      {
        title: "Homepage",
        description:
          "Main landing page introducing the restaurant with featured dishes, branding elements, and quick access to menu and contact options.",
        imgArr: ["/projects/restaurant/pandeliHomepage.png"],
      },
      {
        title: "Menu Page",
        description:
          "Menu section displaying food items offered by the restaurant, allowing customers to browse different dishes and pricing.",
        imgArr: ["/projects/restaurant/menu.png"],
      },
      {
        title: "Footer with Location Map",
        description:
          "Footer section containing restaurant contact details, a WhatsApp call-to-action button, and an embedded Google Map showing the restaurant location.",
        imgArr: ["/projects/restaurant/footer.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "The Hotel & Restaurant Website is a modern and responsive web platform designed to showcase restaurant services, menu items, and contact information in a visually appealing way. The goal of the project was to create a simple digital presence that allows customers to explore food offerings and easily reach the restaurant.",

        "The website features a structured menu page where customers can browse available dishes along with their descriptions and pricing. This helps visitors quickly understand the restaurant’s offerings before visiting or placing an order.",

        "To improve accessibility and communication, the website integrates a WhatsApp contact option that allows users to directly message or call the restaurant with a single click.",

        "The platform also includes a Google Maps integration within the footer section, enabling customers to quickly locate the restaurant and get directions, making it easier for new visitors to find the location.",
      ],
      bullets: [
        "Developed a responsive restaurant website using React and Tailwind CSS.",
        "Created a menu display system to showcase restaurant dishes and pricing.",
        "Integrated WhatsApp contact functionality for direct customer communication.",
        "Embedded Google Maps to display the restaurant’s physical location.",
        "Designed a modern and mobile-friendly user interface.",
        "Optimized page layout for easy navigation and quick access to restaurant information.",
      ],
    },
  },
];

export const featuredProjects = Projects.slice(0, 3);
