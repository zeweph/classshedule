"use client";

import React from "react";
import {
  HomeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";

// Define props interface
interface DashboardSectionProps {
  setActiveSection: (section: string) => void;
}

const DashboardSection: React.FC<DashboardSectionProps> = ({ setActiveSection }) => {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center">
        <HomeIcon className="h-8 w-8 mr-3 text-blue-600" /> Dashboard
      </h2>

      {/* Welcome Text */}
      <p className="text-gray-700 leading-relaxed">
        Welcome to your Student Dashboard! Here you can see an overview of your academic activities.
      </p>

      {/* Overview Stats */}
      <ul className="list-disc list-inside mt-4 space-y-2 text-gray-700">
        <li>Enrolled Courses: <strong>5</strong></li>
        <li>Upcoming Classes Today: <strong>1</strong></li>
        <li>Notifications: <strong>2 New</strong></li>
      </ul>

      {/* Progress Bar */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-blue-700 mb-2">Course Progress</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div className="bg-blue-600 h-4 rounded-full" style={{ width: "65%" }}></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">65% completed</p>
      </div>

      {/* Quick Access Buttons */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-xl font-semibold text-blue-700 mb-2">Quick Access</h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {/* View Schedule */}
          <button
            type="button"
            onClick={() => setActiveSection("mySchedule")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <CalendarDaysIcon className="h-5 w-5 mr-2" />
            View Schedule
          </button>

          {/* Submit Feedback */}
          <button
            type="button"
            onClick={() => setActiveSection("submitFeedback")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            Submit Feedback
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => setActiveSection("notifications")}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <BellAlertIcon className="h-5 w-5 mr-2" />
            Notifications
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSection;
