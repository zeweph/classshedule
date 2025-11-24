"use client";

import React, { useState, useEffect} from 'react';
import axios from "axios";

interface Schedule {
  id: number;
  day_of_week: string;
  course_name: string;
  instructor_name: string;
  room: string;
  start_time: string;
  end_time: string;
  department_id?: number;
  department_name?: string;
}

interface Department {
  department_id: number;
  department_name: string;
}
interface UserSession {
  loggedIn: boolean;
  user?: {
    id: number;
    id_number:string;
    full_name:string;
    username: string;
    email: string;
    role: string;
    status:string;
    department_id:number;
    department_name:string;
  };
} 
// Main App component
export default function App() {
    const [batch, setBatch] = useState<string>("First year");
  const [semester, setSemester] = useState<string>("First");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>();
  const [session, setSession] = useState<UserSession | null>(null);
  
  

  
  const [section,setSection]=useState<string>('A');
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Find selected department name efficiently


   const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
   useEffect(() => {
      const checkSession = async () => {
        try {
          const res = await axios.get(`${API_URL}/api/auth/profile`, { withCredentials: true });
          setSession(res.data);
          setSelectedDepartmentId(res.data?.user?.department_id);
          await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay
        } catch (err) {
          console.error("Failed to fetch session:", err);
          setSession({ loggedIn: false });
        } 
      };
      checkSession();
    }, []);
  // Fetch departments from backend

  // Fetch schedules with error handling
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!batch || !semester || !selectedDepartmentId) return;

      try {
        setLoading(true);
        setError(null);
        const res = await axios.get("http://localhost:5000/api/schedules/batch", {
          params: { batch, semester,section, department_id: selectedDepartmentId },
        });
        setSchedules(res.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || err.message || "Failed to fetch schedules";
        setError(errorMessage);
        console.error("Fetch schedules failed:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [batch, semester,section, selectedDepartmentId]);

  // Format time to be more readable
  const formatTime = (timeString: string) => {
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };
    const getDayLightColor = (day: string) => {
    const colors = {
      Monday: "bg-blue-50 border-blue-100 text-blue-700",
      Tuesday: "bg-green-50 border-green-100 text-green-700",
      Wednesday: "bg-purple-50 border-purple-100 text-purple-700",
      Thursday: "bg-orange-50 border-orange-100 text-orange-700",
      Friday: "bg-red-50 border-red-100 text-red-700",
      Saturday: "bg-indigo-50 border-indigo-100 text-indigo-700",
      Sunday: "bg-pink-50 border-pink-100 text-pink-700"
    };
    return colors[day as keyof typeof colors] || "bg-gray-50 border-gray-100 text-gray-700";
  };
  const getDayColor = (day: string) => {
    const colors = {
      Monday: "from-blue-500 to-blue-600 text-white",
      Tuesday: "from-green-500 to-green-600 text-white", 
      Wednesday: "from-purple-500 to-purple-600 text-white",
      Thursday: "from-orange-500 to-orange-600 text-white",
      Friday: "from-red-500 to-red-600 text-white",
      Saturday: "from-indigo-500 to-indigo-600 text-white",
      Sunday: "from-pink-500 to-pink-600 text-white"
    };
    return colors[day as keyof typeof colors] || "from-gray-500 to-gray-600 text-white";
  };

  // Extract unique time slots from schedules
  const timeSlots = Array.from(
    new Set(schedules.map(s => `${s.start_time}-${s.end_time}`))
  ).sort();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 font-sans text-gray-800">
      <div className="container mx-auto max-w-5xl">

        {/* Main Schedule Header with new information */}
         <div className="text-center mt-8 animate-fade-in">
                <div className="inline-flex flex-wrap items-center gap-3 bg-white/80 backdrop-blur-sm px-8 py-5 rounded-3xl border border-white/60 shadow-lg shadow-blue-500/5">
                  <span className="text-gray-600 font-medium text-lg">Currently viewing</span>
                  <span className="font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-3 rounded-full text-sm shadow-lg transform transition-all duration-300 hover:scale-105">
                    {session?.user?.department_name}
                  </span>
                  <span className="text-gray-300 text-xl">•</span>
                  <span className="font-bold bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-5 py-3 rounded-full text-sm shadow-lg transform transition-all duration-300 hover:scale-105">
                    {batch}
                  </span>
                  <span className="text-gray-300 text-xl">•</span>
                  <span className="font-bold bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white px-5 py-3 rounded-full text-sm shadow-lg transform transition-all duration-300 hover:scale-105">
                    {semester} Semester
                  </span>
                  <span className="text-gray-300 text-xl">•</span>
                  <span className="font-bold bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-3 rounded-full text-sm shadow-lg transform transition-all duration-300 hover:scale-105">
                    {section === '1' ? 'Single Class' : "Section " + section}
                  </span>
                </div>
              </div>

        {/* Download Button */}
        <div className="flex justify-end mb-4">
          <button
            // onClick={handleDownloadPDF}
            className="flex items-center space-x-2 rounded-full bg-blue-700 px-6 py-3 text-white shadow-md transition-transform duration-200 hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {/* Download Icon (Inline SVG) */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.707-9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L10 10.586V3a1 1 0 10-2 0v7.586l-1.293-1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-semibold">Download </span>
          </button>
        </div>

        {/* Schedule Table */}
       <div className="rounded-3xl overflow-hidden border border-gray-200/40 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100/80 backdrop-blur-sm">
                        <th className="border border-gray-200/60 px-8 py-6 text-left font-bold text-gray-700 text-lg">
                          ⏰ Time
                        </th>
                        {days.map(day => (
                          <th 
                            key={day} 
                            className={`border border-gray-200/60 px-6 py-6 text-center font-bold text-lg bg-gradient-to-r ${getDayColor(day)} transition-all duration-300 hover:scale-105`}
                          >
                            {day}
                          </th>
                        ))}
                      </tr>
                    </thead>
                     <tbody>
                      {/* Morning Sessions */}
                      {timeSlots.map((slot, index) => (
                        formatTime(slot.split("-")[0]) < '6:00 AM' ?(
                        <tr 
                          key={`morning-${slot}`} 
                          className={`border-b border-gray-200/50 transform transition-all duration-300 hover:scale-[1.02] ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          } hover:bg-blue-50/50`}
                        >
                          <td className="border border-gray-200/60 px-8 py-6 font-semibold bg-gradient-to-b from-gray-50 to-white">
                            <div className="flex flex-col items-center">
                              <div className="font-bold text-gray-800 text-lg">
                                {formatTime(slot.split("-")[0])}
                              </div>
                              <div className="text-sm text-gray-400 my-1">to</div>
                              <div className="font-bold text-gray-800 text-lg">
                                {formatTime(slot.split("-")[1])}
                              </div>
                              <div className="text-xs text-blue-500 font-medium mt-2 bg-blue-100 px-2 py-1 rounded-full">
                                Morning
                              </div>
                            </div>
                          </td>
                          {days.map(day => {
                            const schedule = schedules.find(
                              s => s.day_of_week === day && `${s.start_time}-${s.end_time}` === slot
                            );
                            return (
                              <td key={day} className="border border-gray-200/60 px-4 py-4">
                                {schedule ? (
                                  <div className={`p-4 rounded-2xl border-l-4 ${getDayLightColor(day)} shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                                    <div className="font-bold text-gray-800 mb-2 line-clamp-2 text-lg">
                                      {schedule.course_name}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                      <span>👨‍🏫</span>
                                      {schedule.instructor_name}
                                    </div>
                                    <span className="inline-block bg-white/90 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl border shadow-sm">
                                      🏠 {schedule.room}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-gray-300 text-center py-8 text-lg font-medium">
                                    Free Period
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>):(<></>)
                      ))}

                      {/* Lunch Break */}
                      <tr className="bg-gradient-to-r from-amber-50 to-orange-50 border-y-4 border-amber-200/60">
                        <td 
                          colSpan={8} 
                          className="px-8 py-8 text-center font-extrabold text-2xl text-amber-700 animate-pulse"
                        >
                          <div className="flex items-center justify-center gap-4">
                            <span className="text-4xl">🍽️</span>
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                              Lunch Break • 6:00 AM - 7:00 AM
                            </span>
                            <span className="text-4xl">🍽️</span>
                          </div>
                          <div className="text-sm text-amber-600 font-normal mt-2">
                            Time to recharge and refresh
                          </div>
                        </td>
                      </tr>

                      {/* Afternoon Sessions */}
                       {timeSlots.map((slot, index) => (
                        formatTime(slot.split("-")[0]) < '6:00 AM' ?(
                        <tr 
                          key={`morning-${slot}`} 
                          className={`border-b border-gray-200/50 transform transition-all duration-300 hover:scale-[1.02] ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                          } hover:bg-blue-50/50`}
                        >
                          <td className="border border-gray-200/60 px-8 py-6 font-semibold bg-gradient-to-b from-gray-50 to-white">
                            <div className="flex flex-col items-center">
                              <div className="font-bold text-gray-800 text-lg">
                                {formatTime(slot.split("-")[0])}
                              </div>
                              <div className="text-sm text-gray-400 my-1">to</div>
                              <div className="font-bold text-gray-800 text-lg">
                                {formatTime(slot.split("-")[1])}
                              </div>
                              <div className="text-xs text-blue-500 font-medium mt-2 bg-blue-100 px-2 py-1 rounded-full">
                                Afternoon
                              </div>
                            </div>
                          </td>
                          {days.map(day => {
                            const schedule = schedules.find(
                              s => s.day_of_week === day && `${s.start_time}-${s.end_time}` === slot
                            );
                            return (
                              <td key={day} className="border border-gray-200/60 px-4 py-4">
                                {schedule ? (
                                  <div className={`p-4 rounded-2xl border-l-4 ${getDayLightColor(day)} shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}>
                                    <div className="font-bold text-gray-800 mb-2 line-clamp-2 text-lg">
                                      {schedule.course_name}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-3 flex items-center gap-2">
                                      <span>👨‍🏫</span>
                                      {schedule.instructor_name}
                                    </div>
                                    <span className="inline-block bg-white/90 text-gray-700 text-xs font-semibold px-3 py-2 rounded-xl border shadow-sm">
                                      🏠 {schedule.room}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-gray-300 text-center py-8 text-lg font-medium">
                                    Free Period
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>):(<></>)
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
      </div>
    </div>
  );
}
