"use client";

import {
  ScrollArea,
  Text,
  Group,
  Collapse,
} from "@mantine/core";
import {
  BellIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  ChevronDownIcon,
  PlusIcon,
  EyeIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

import AnnouncementsSection from "./AnnouncementsSection";
import DashboardSection from "./DashboardSection";
import HelpSupportSection from "./HelpSupportSection";
import ViewFeedbackSection from "./ViewFeedbackSection";
import InstructorScheduleView from "./viewinstructor";
import ManageInstructor from "./ManageInstructor";
import AddSchedule from "./addschedule";
import ShowCourse from "./ShowCourse";
import BatchSemesterSelector from "./BatchSemesterSelector";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setActiveSection } from "@/store/slices/uiSlice";


export const DepSidebar = () => {
  const dispatch = useAppDispatch();
  const { activeSection } = useAppSelector((state) => state.ui);
  const [scheduleMenuOpened, setScheduleMenuOpened] = useState(false);

  
  const handleSetActiveSection = (section: string) => {
    dispatch(setActiveSection(section));
  };

  const handleToggleScheduleMenu = () => {
    setScheduleMenuOpened(!scheduleMenuOpened);
  };

  const sidebarLinks = [
    { key: "dashboard", icon: HomeIcon, label: "Dashboard" },
    { key: "manageinst", icon: UsersIcon, label: "Manage Instructor" },
    { 
      key: "manageSchedule", 
      icon: CalendarDaysIcon, 
      label: "Manage Schedule",
      hasSubmenu: true 
    },
    { key: "announcements", icon: BellIcon, label: "Announcements" },
    { key: "viewFeedback", icon: ChatBubbleLeftRightIcon, label: "View Feedback" },
    { key: "helpSupport", icon: QuestionMarkCircleIcon, label: "Help & Support" },
  ];

  const isScheduleActive = activeSection === "addSchedule" || activeSection === "viewSchedule" || activeSection === "manageSchedule";

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {sidebarLinks.map(({ key, icon: Icon, label, hasSubmenu }) => {
            if (hasSubmenu) {
              return (
                <div key={key} className="space-y-1">
                  {/* Main Schedule Button */}
                  <button
                    onClick={handleToggleScheduleMenu}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
                      isScheduleActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    <Group gap="xs">
                      <Icon className={`h-5 w-5 ${
                        isScheduleActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
                      }`} />
                      <span className="font-medium text-sm">{label}</span>
                    </Group>
                    <ChevronDownIcon 
                      className={`h-4 w-4 transition-transform duration-200 ${
                        scheduleMenuOpened ? 'rotate-180' : ''
                      } ${isScheduleActive ? 'text-white' : 'text-gray-400'}`} 
                    />
                  </button>

                  {/* Submenu Items - Stays open after clicking and doesn't auto-close */}
                  <Collapse in={scheduleMenuOpened}>
                    <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
                      {/* Add Schedule */}
                      <button
                        onClick={() => handleSetActiveSection("addSchedule")}
                        className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 text-left group ${
                          activeSection === "addSchedule"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <PlusIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                        <span className="font-medium text-sm">Add Schedule</span>
                      </button>

                      {/* View Schedule */}
                      <button
                        onClick={() => handleSetActiveSection("viewSchedule")}
                        className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 text-left group ${
                          activeSection === "viewSchedule"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                        <span className="font-medium text-sm">View Schedule</span>
                      </button>
                      <button
                        onClick={() => handleSetActiveSection("View instructor Schedule")}
                        className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 text-left group ${
                          activeSection === "View instructor Schedule"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <MagnifyingGlassIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                        <span className="font-medium text-sm">Shedule search by instructor </span>
                      </button>
                      <button
                        onClick={() => handleSetActiveSection("viewcourse")}
                        className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 text-left group ${
                          activeSection === "viewcourse"
                            ? "bg-blue-100 text-blue-700 border border-blue-200"
                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        <EyeIcon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                        <span className="font-medium text-sm">View Course</span>
                      </button>
                    </div>
                  </Collapse>
                </div>
              );
            }

            // Regular menu items
            return (
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
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

// Updated render function to include the new schedule sections
export const renderSectionOnDepSidbar = (activeSection: string, setActiveSection: (section: string) => void) => {
  switch (activeSection) {
    case "dashboard":
      return <DashboardSection setActiveSection={setActiveSection} />;
    case "manageinst":
      return <ManageInstructor />;
   case "addSchedule":
      return <AddSchedule />;
    case "viewSchedule":
      return <BatchSemesterSelector />;
    case "viewcourse":
      return <ShowCourse />;
    case "View instructor Schedule":
      return <InstructorScheduleView />;
    case "announcements":
      return <AnnouncementsSection />;
    case "viewFeedback":
      return <ViewFeedbackSection />;
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