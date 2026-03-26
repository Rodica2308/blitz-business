import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Building, Users, FileText, Store, Plus, BookText, FileIcon, LucideIcon } from "lucide-react";
import { forwardRef } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavigationSectionProps {
  title: string;
  icon: LucideIcon;
  color: string;
  items?: { name: string; path: string; icon: LucideIcon }[];
}

const NavigationSection = ({ title, icon: Icon, color, items }: NavigationSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-6">
      <button
        className="flex items-center justify-between w-full text-left font-medium py-2 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="flex items-center">
          <Icon className={`mr-3 text-${color}`} />
          {title}
        </span>
        <ChevronDown
          className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && items && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 ml-5 space-y-1">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.path}
                  className="flex items-center px-4 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <item.icon className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {item.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const [location] = useLocation();
  const { isAuthenticated } = useAuth();

  // Calculate sidebar classes
  const sidebarClasses = `w-64 h-screen bg-white dark:bg-gray-800 shadow-md fixed lg:relative z-30 transition-transform duration-300 ease-in-out ${
    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
  }`;

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-semibold text-primary dark:text-blue-400">Blitz Business</h1>
        <button
          onClick={onClose}
          className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="py-4 overflow-y-auto h-[calc(100vh-64px)]">
        <nav className="px-4">
          <NavigationSection
            title="Blitz Business"
            icon={Building}
            color="primary"
            items={[
              { name: "Afacerile mele", path: "/", icon: Store },
              { name: "Adaugă afacere", path: "/businesses/new", icon: Plus },
            ]}
          />

          <NavigationSection
            title="Resurse"
            icon={FileText}
            color="secondary"
            items={[
              { name: "Ghid finanțare", path: "/", icon: BookText },
              { name: "Model afacere", path: "/", icon: FileIcon },
            ]}
          />

          <Separator className="my-4 dark:border-gray-700" />

          <Link
            href={isAuthenticated ? "/admin" : "/"}
            className="flex items-center px-2 py-2 font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={(e) => {
              if (!isAuthenticated) {
                e.preventDefault();
                // Open login modal from LocationContext
                window.dispatchEvent(new CustomEvent("open-login-modal"));
              }
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-gray-600 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Panou Administrator
          </Link>
        </nav>
      </div>
    </aside>
  );
};

// Custom icon component using forwardRef
const GovernmentIcon = forwardRef((props: any, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    ref={ref}
  >
    <path d="M2 20h20v2H2z" />
    <path d="M12 2L2 8h20L12 2z" />
    <path d="M5 10v8h3v-8H5z" />
    <path d="M10.5 10v8h3v-8h-3z" />
    <path d="M16 10v8h3v-8h-3z" />
  </svg>
));
GovernmentIcon.displayName = "GovernmentIcon";

const CalendarIcon = forwardRef((props: any, ref) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    ref={ref}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <path d="M8 14h.01" />
    <path d="M12 14h.01" />
    <path d="M16 14h.01" />
    <path d="M8 18h.01" />
    <path d="M12 18h.01" />
    <path d="M16 18h.01" />
  </svg>
));
CalendarIcon.displayName = "CalendarIcon";

export default Sidebar;
