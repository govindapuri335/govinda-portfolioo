import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Award,
  Banknote,
  BarChart3,
  BookMarked,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Calculator,
  Calendar,
  ChartCandlestick,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Coins,
  CreditCard,
  DollarSign,
  File,
  FileCheck,
  FileSearch,
  FileSpreadsheet,
  FileText,
  Filter,
  Gavel,
  Handshake,
  HelpCircle,
  Image,
  Landmark,
  Laptop,
  LineChart,
  Loader2,
  LucideProps,
  Menu,
  Moon,
  MoreVertical,
  Music,
  Palette,
  Percent,
  Phone,
  PieChart,
  PiggyBank,
  Pizza,
  Plus,
  Receipt,
  Scale,
  Scroll,
  Search,
  Settings,
  ShieldCheck,
  Signature,
  Sparkles,
  SunMedium,
  Target,
  Trash,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { AiFillStar } from "react-icons/ai";
import { BiLaugh, BiSolidUser } from "react-icons/bi";
import { BsInfoCircle, BsQuestionCircle } from "react-icons/bs";
import { FaLinkedin } from "react-icons/fa";
import {
  HiBriefcase,
  HiOutlineExternalLink,
  HiOutlineLink,
} from "react-icons/hi";
import { IoIosGitBranch } from "react-icons/io";
import {
  SiAngular,
  SiBootstrap,
  SiExpress,
  SiGmail,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMui,
  SiMysql,
  SiNestjs,
  SiNetlify,
  SiNextdotjs,
  SiNodedotjs,
  SiReact,
  SiRedux,
  SiSocketdotio,
  SiTailwindcss,
  SiTypescript,
  SiWhatsapp,
  SiX,
} from "react-icons/si";

export const Icons = {
  contact: Phone,
  gitRepoIcon: BookMarked,
  gitOrgBuilding: Building,
  gitBranch: IoIosGitBranch,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  post: FileText,
  page: File,
  media: Image,
  settings: Settings,
  billing: CreditCard,
  ellipsis: MoreVertical,
  add: Plus,
  warning: AlertTriangle,
  user: User,
  arrowRight: ArrowRight,
  help: HelpCircle,
  pizza: Pizza,
  sun: SunMedium,
  moon: Moon,
  laptop: Laptop,
  menu: Menu,
  chevronDown: ChevronDown,
  laughEmoji: BiLaugh,
  check: Check,
  calendar: Calendar,
  clock: Clock,
  infoMark: BsInfoCircle,
  questionMark: BsQuestionCircle,
  link: HiOutlineLink,
  externalLink: HiOutlineExternalLink,
  star: AiFillStar,

  // Finance / accounting / credit-analyst icons
  banknote: Banknote,
  coins: Coins,
  dollarSign: DollarSign,
  wallet: Wallet,
  piggyBank: PiggyBank,
  landmark: Landmark,
  building2: Building2,
  briefcase: Briefcase,
  calculator: Calculator,
  receipt: Receipt,
  percent: Percent,
  scale: Scale,

  // Charts / analysis
  barChart: BarChart3,
  lineChart: LineChart,
  pieChart: PieChart,
  chartCandlestick: ChartCandlestick,
  trendingUp: TrendingUp,
  trendingDown: TrendingDown,
  activity: Activity,

  // Documents / audit / compliance
  fileSpreadsheet: FileSpreadsheet,
  fileCheck: FileCheck,
  fileSearch: FileSearch,
  clipboardList: ClipboardList,
  bookOpen: BookOpen,
  signature: Signature,
  shieldCheck: ShieldCheck,
  gavel: Gavel,

  // Deals / goals / team
  handshake: Handshake,
  target: Target,
  award: Award,
  users: Users,
  search: Search,
  filter: Filter,

  // SiAmazonwebservices not available in this react-icons build; use a neutral building icon as a fallback
  amazonaws: Building,
  angular: SiAngular,
  bootstrap: SiBootstrap,
  // SiCss3 isn't exported in this package version; fall back to a generic file icon
  css3: File,
  express: SiExpress,
  graphql: SiGraphql,
  html5: SiHtml5,
  javascript: SiJavascript,
  mongodb: SiMongodb,
  mui: SiMui,
  mysql: SiMysql,
  nestjs: SiNestjs,
  netlify: SiNetlify,
  nextjs: SiNextdotjs,
  nodejs: SiNodedotjs,
  react: SiReact,
  redux: SiRedux,
  socketio: SiSocketdotio,
  tailwindcss: SiTailwindcss,
  typescript: SiTypescript,
  gmail: SiGmail,
  linkedin: FaLinkedin,
  twitter: SiX,
  whatsapp: SiWhatsapp,
  userFill: BiSolidUser,
  work: HiBriefcase,
  successAnimated: ({ ...props }: LucideProps) => (
    <div className="svg-container">
      <svg
        className="ft-green-tick"
        xmlns="http://www.w3.org/2000/svg"
        height="5rem"
        width="5rem"
        viewBox="0 0 48 48"
        aria-hidden="true"
        {...props}
      >
        <circle className="circle" cx="24" cy="24" r="22" />
        <path
          className="tick"
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeMiterlimit={10}
          d="M14 27l5.917 4.917L34 17"
        />
      </svg>
    </div>
  ),
  retro: Palette,
  cyberpunk: Zap,
  paper: Scroll,
  aurora: Sparkles,
  synthwave: Music,
};
