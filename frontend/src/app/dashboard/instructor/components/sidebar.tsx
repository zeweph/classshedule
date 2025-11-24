"use client";

import {
  ScrollArea,
  Text,
} from "@mantine/core";
import {
  HomeIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

// Existing components
import DashboardSection from "./DashboardSection";
import MyCoursesSection from "./MyCoursesSection";
import SubmitFeedbackSection from "./SubmitFeedbackSection";
import HelpSupportSection from "./HelpSupportSection";
import ClassAvailabilitySection from "./ClassAvailabilitySection";
import AccountUpdateSection from "./AccountUpdateSection";
import AnnouncementsSection from "./AnnouncementsSection";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setActiveSection } from "@/store/slices/uiSlice";


export const InstSidebar = () => {
  const dispatch = useAppDispatch();
  const { activeSection } = useAppSelector((state) => state.ui);

  const handleSetActiveSection = (section: string) => {
    dispatch(setActiveSection(section));
  };

  const sidebarLinks = [
   { key: "dashboard", icon: HomeIcon, label: "Dashboard" },
    { key: "My Teaching Schedule", icon: CalendarDaysIcon, label: "My Schedule" },
    { key: "announcements", icon: BellIcon, label: "Announcements" },
    { key: "submitFeedback", icon: ChatBubbleLeftRightIcon, label: "Submit Feedback" },
    { key: "helpSupport", icon: QuestionMarkCircleIcon, label: "Help & Support" },
  ];


  return (
    <div className="flex flex-col h-full bg-white">
      {/* Sidebar Header - Only for desktop */}
      
      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {sidebarLinks.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => handleSetActiveSection(key)}
              className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group ${
                activeSection === key
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              <Icon className={`h-5 w-5 mr-3 ${
                activeSection === key ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
              }`} />
              <span className="font-medium text-sm">{label}</span>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export const renderSectionOnInst = (activeSection: string, setActiveSection: (section: string) => void) => {
 switch (activeSection) {
      case "dashboard":
       return <DashboardSection setActiveSection={setActiveSection} />;
      case "My Teaching Schedule":
        return <MyCoursesSection />;
      case "classSchedule":
        return <ClassAvailabilitySection />;
      case "announcements":
        return <AnnouncementsSection />;
      case "accountUpdate":
        return <AccountUpdateSection />;
      case "submitFeedback":
        return <SubmitFeedbackSection />;
      case "helpSupport":
        return <HelpSupportSection />;
      default:
      return (
        <div className="text-center py-12">
          <Text size="xl" c="dimmed">Select a section from the sidebar</Text>
        </div>
      );
  }
};