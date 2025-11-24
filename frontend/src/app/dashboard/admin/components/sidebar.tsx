/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
  ScrollArea,
  Text,
  Group,
  Collapse,
} from "@mantine/core";
import {
  AcademicCapIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  ChevronDownIcon,
  PlusIcon,
  BuildingOffice2Icon,
  Cog6ToothIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  BuildingOfficeIcon,
  HomeModernIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  EyeIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentTextIcon
} from "@heroicons/react/24/outline";
import { useState } from "react";

import DashboardSection from "./DashboardSection";
import ManageUsersSection from "./ManageUsersSection";
import ManageDeptSection from "./ManageDeptSection";
import SystemSettingsSection from "./SystemSettingsSection";
import ViewFeedbackSection from "./ViewFeedbackSection";
import HelpSupportSection from "./HelpSupportSection";
import ManageCourse from "./ManageCourse";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setActiveSection } from "@/store/slices/uiSlice";
import BlocksManager from "./BlocksManager";
import FloorsManager from "./FloorsManager";
import RoomsManager from "./RoomsManager";
import AssignHead from "./AssignHeadModal";
import BatchManagement from "./BatchManagement";
import SemesterManagement from "./SemesterManagement";

export const AdminSidebar = () => {
  const dispatch = useAppDispatch();
  const { activeSection } = useAppSelector((state) => state.ui);
  const [courseMenuOpened, setCourseMenuOpened] = useState(true);
  const [usersMenuOpened, setUsersMenuOpened] = useState(true);
  const [roomMenuOpened, setRoomMenuOpened] = useState(true);
  const [departmentMenuOpened, setDepartmentMenuOpened] = useState(true);
  const [systemMenuOpened, setSystemMenuOpened] = useState(true);
  const [feedbackMenuOpened, setFeedbackMenuOpened] = useState(true);
  const [batchMenuOpened, setBatchMenuOpened] = useState(true);

  const handleSetActiveSection = (section: string) => {
    dispatch(setActiveSection(section));
  };

  const handleToggleCourseMenu = () => {
    setCourseMenuOpened(!courseMenuOpened);
  };

  const handleToggleUsersMenu = () => {
    setUsersMenuOpened(!usersMenuOpened);
  };

  const handleToggleRoomMenu = () => {
    setRoomMenuOpened(!roomMenuOpened);
  };

  const handleToggleDepartmentMenu = () => {
    setDepartmentMenuOpened(!departmentMenuOpened);
  };

  const handleToggleSystemMenu = () => {
    setSystemMenuOpened(!systemMenuOpened);
  };

  const handleToggleFeedbackMenu = () => {
    setFeedbackMenuOpened(!feedbackMenuOpened);
  };

  const handleToggleBatchMenu = () => {
    setBatchMenuOpened(!batchMenuOpened);
  };

  const sidebarLinks = [
    { key: "dashboard", icon: HomeIcon, label: "Dashboard" },
    { 
      key: "manageUsers", 
      icon: UsersIcon, 
      label: "Manage Users",
      hasSubmenu: true 
    },
    { 
      key: "manageDepartment", 
      icon: BuildingLibraryIcon, 
      label: "Departments",
      hasSubmenu: true 
    },
    { 
      key: "manageCourse", 
      icon: AcademicCapIcon, 
      label: "Manage Courses",
      hasSubmenu: true 
    },
    { 
      key: "roomManagement", 
      icon: BuildingOffice2Icon, 
      label: "Room Management",
      hasSubmenu: true 
    },
    { 
      key: "batchManagement", 
      icon: CalendarIcon, 
      label: "Batch Management",
      hasSubmenu: true 
    },
    { 
      key: "systemSettings", 
      icon: Cog6ToothIcon, 
      label: "System Settings",
      hasSubmenu: true 
    },
    { 
      key: "viewFeedback", 
      icon: ChatBubbleLeftRightIcon, 
      label: "Feedback & Support",
      hasSubmenu: true 
    },
  ];

  const isCourseActive = activeSection === 'addcourse' || activeSection === 'managecourse';
  const isUsersActive = activeSection === 'addUser' || activeSection === 'manageUsers';
  const isRoomActive = activeSection === 'blocks' || activeSection === 'floors' || activeSection === 'rooms';
  const isDepartmentActive = activeSection === 'manageDepartments' || activeSection === 'assignHead';
  const isSystemActive = activeSection === 'generalSettings' || activeSection === 'advancedSettings' || activeSection === 'systemReports';
  const isFeedbackActive = activeSection === 'viewFeedback' || activeSection === 'helpSupport';
  const isBatchActive = activeSection === 'batch' || activeSection === 'semester';

  const renderSubmenu = (key: string, Icon: any, label: string, submenuItems: any[]) => {
    const isActive = getActiveState(key);
    const isOpened = getMenuState(key);
    const toggleMenu = getToggleHandler(key);

    return (
      <div key={key} className="space-y-1">
        {/* Main Menu Button */}
        <button
          onClick={toggleMenu}
          className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 group ${
            isActive
              ? "bg-blue-600 text-white shadow-md"
              : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
          }`}
        >
          <Group gap="xs">
            <Icon className={`h-5 w-5 ${
              isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
            }`} />
            <span className="font-medium text-sm">{label}</span>
          </Group>
          <ChevronDownIcon 
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpened ? 'rotate-180' : ''
            } ${isActive ? 'text-white' : 'text-gray-400'}`} 
          />
        </button>

        {/* Submenu Items */}
        <Collapse in={isOpened}>
          <div className="ml-4 space-y-1 border-l-2 border-gray-200 pl-2">
            {submenuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSetActiveSection(item.key)}
                className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 text-left group ${
                  activeSection === item.key
                    ? "bg-blue-100 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                <item.icon className="h-4 w-4 mr-2 text-gray-500 group-hover:text-blue-600" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </Collapse>
      </div>
    );
  };

  const getActiveState = (key: string) => {
    switch (key) {
      case "manageCourse": return isCourseActive;
      case "manageUsers": return isUsersActive;
      case "roomManagement": return isRoomActive;
      case "manageDepartment": return isDepartmentActive;
      case "systemSettings": return isSystemActive;
      case "viewFeedback": return isFeedbackActive;
      case "batchManagement": return isBatchActive;
      default: return false;
    }
  };

  const getMenuState = (key: string) => {
    switch (key) {
      case "manageCourse": return courseMenuOpened;
      case "manageUsers": return usersMenuOpened;
      case "roomManagement": return roomMenuOpened;
      case "manageDepartment": return departmentMenuOpened;
      case "systemSettings": return systemMenuOpened;
      case "viewFeedback": return feedbackMenuOpened;
      case "batchManagement": return batchMenuOpened;
      default: return false;
    }
  };

  const getToggleHandler = (key: string) => {
    switch (key) {
      case "manageCourse": return handleToggleCourseMenu;
      case "manageUsers": return handleToggleUsersMenu;
      case "roomManagement": return handleToggleRoomMenu;
      case "manageDepartment": return handleToggleDepartmentMenu;
      case "systemSettings": return handleToggleSystemMenu;
      case "viewFeedback": return handleToggleFeedbackMenu;
      case "batchManagement": return handleToggleBatchMenu;
      default: return () => {};
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-1">
          {/* Dashboard */}
          <button
            onClick={() => handleSetActiveSection("dashboard")}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group ${
              activeSection === "dashboard"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <HomeIcon className={`h-5 w-5 mr-3 ${
              activeSection === "dashboard" ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
            }`} />
            <span className="font-medium text-sm">Dashboard</span>
          </button>

          {/* Users Management */}
          <button
            onClick={() => handleSetActiveSection("manageUsers")}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group ${
              activeSection === "manageUsers"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <UsersIcon className={`h-5 w-5 mr-3 ${
              activeSection === "manageUsers" ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
            }`} />
            <span className="font-medium text-sm">Manage Users</span>
          </button>

          {/* Course Management */}
          <button
            onClick={() => handleSetActiveSection("manageCourse")}
            className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-left group ${
              activeSection === "manageCourse"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <AcademicCapIcon className={`h-5 w-5 mr-3 ${
              activeSection === "manageCourse" ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'
            }`} />
            <span className="font-medium text-sm">Manage Course</span>
          </button>

          {/* Departments Dropdown */}
          {renderSubmenu("manageDepartment", BuildingLibraryIcon, "Departments", [
            { key: "manageDepartments", icon: UserGroupIcon, label: "Manage Departments" },
            { key: "assignHead", icon: UserPlusIcon, label: "Assign Head" },
          ])}

          {/* Room Management Dropdown */}
          {renderSubmenu("roomManagement", BuildingOffice2Icon, "Room Management", [
            { key: "blocks", icon: BuildingStorefrontIcon, label: "Manage Blocks" },
            { key: "floors", icon: BuildingOfficeIcon, label: "Manage Floors" },
            { key: "rooms", icon: HomeModernIcon, label: "Manage Rooms" },
          ])}

          {/* Batch Management Dropdown */}
          {renderSubmenu("batchManagement", CalendarIcon, "Batch Management", [
            { key: "batch", icon: DocumentTextIcon, label: "Manage Batches" },
            { key: "semester", icon: CalendarIcon, label: "Manage Semesters" },
          ])}

          {/* System Settings Dropdown */}
          {renderSubmenu("systemSettings", Cog6ToothIcon, "System Settings", [
            { key: "generalSettings", icon: Cog6ToothIcon, label: "General Settings" },
            { key: "advancedSettings", icon: WrenchScrewdriverIcon, label: "Advanced Settings" },
            { key: "systemReports", icon: ChartBarIcon, label: "System Reports" },
          ])}

          {/* Feedback & Support Dropdown */}
          {renderSubmenu("viewFeedback", ChatBubbleLeftRightIcon, "Feedback & Support", [
            { key: "viewFeedback", icon: EyeIcon, label: "View Feedback" },
            { key: "helpSupport", icon: QuestionMarkCircleIcon, label: "Help & Support" },
          ])}
        </div>
      </ScrollArea>
    </div>
  );
};

// Updated render function to include all new sections
export const renderSection = (activeSection: string, setActiveSection: (section: string) => void) => {
  switch (activeSection) {
    case "dashboard": 
      return <DashboardSection setActiveSection={setActiveSection} />;
    
    // Users Management
    case "manageUsers": 
      return <ManageUsersSection />;

    // Departments Management
    case "manageDepartments": 
      return <ManageDeptSection />;
    case "assignHead": 
      return <AssignHead />;
    
    // Courses Management
    case "manageCourse": 
      return <ManageCourse />;
    
    // Room Management
    case "blocks":
      return <BlocksManager />;
    case "floors":
      return <FloorsManager />;
    case "rooms":
      return <RoomsManager />;
    
    // Batch Management
    case "batch":
      return <BatchManagement />;
    case "semester":
      return <SemesterManagement />;
    
    // System Settings
    case "systemSettings": 
      return <SystemSettingsSection />;
    case "generalSettings":
      return <SystemSettingsSection />;
    case "advancedSettings":
      return <SystemSettingsSection />;
    case "systemReports":
      return <SystemSettingsSection />;
    
    // Feedback & Support
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