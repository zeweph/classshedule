"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Header from "../compnent/header";
import Footer from "@/compnent/footer";
import FeedbackModal from "./feedback/page";
import { Card, Group, Text, Badge, Avatar, Progress } from "@mantine/core";
import { ChatBubbleLeftEllipsisIcon, UsersIcon, AcademicCapIcon } from "@heroicons/react/24/solid";

const ScheduleHomePage = () => {
  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  const fullText = " Welcome to Woldia University's\nClass Schedule Management System";
  const typingSpeed = 50;
  const cursorBlinkSpeed = 500;
  const textIndex = useRef(0);

  const departments = [
    { id: 1, name: "Computer Science", head: "Dr. Sarah Johnson", students: 450, instructors: 25, color: "blue", progress: 75, avatar: "CS" },
    { id: 2, name: "Electrical Engineering", head: "Prof. Michael Chen", students: 380, instructors: 18, color: "green", progress: 60, avatar: "EE" },
    { id: 3, name: "Business Administration", head: "Dr. Emily Rodriguez", students: 520, instructors: 22, color: "violet", progress: 85, avatar: "BA" },
    { id: 4, name: "Mechanical Engineering", head: "Prof. James Wilson", students: 420, instructors: 20, color: "orange", progress: 70, avatar: "ME" },
    { id: 5, name: "Civil Engineering", head: "Dr. Robert Brown", students: 350, instructors: 16, color: "red", progress: 55, avatar: "CE" },
    { id: 6, name: "Mathematics", head: "Prof. Lisa Wang", students: 280, instructors: 15, color: "cyan", progress: 65, avatar: "MTH" },
  ];

  const todaySchedule = [
    { id: 1, instructor: "Dr. Selam Abate", department: "Computer Science", className: "Web Development II", start_time: "09:00 AM", end_time: "10:30 AM", room: "Lab 203", color: "blue" },
    { id: 2, instructor: "Mr. Samuel Tadesse", department: "Information Systems", className: "Database Design", start_time: "11:00 AM", end_time: "12:30 PM", room: "Room 105", color: "green" },
    { id: 3, instructor: "Ms. Hana Lemma", department: "Software Engineering", className: "Object-Oriented Programming", start_time: "2:00 PM", end_time: "3:30 PM", room: "Room 302", color: "violet" },
    { id: 4, instructor: "Dr. Bekele Alemu", department: "Electrical Engineering", className: "Digital Logic Design", start_time: "3:30 PM", end_time: "5:00 PM", room: "Lab 110", color: "orange" },
  ];

  const announcements = [
    { id: 1, department: "Computer Science", announcement: "Midterm exams start next week — check the portal for schedule.", date: "Nov 7, 2025", category: "Exam", categoryColor: "red" },
    { id: 2, department: "Information Systems", announcement: "New course materials uploaded for Database Systems II.", date: "Nov 6, 2025", category: "Update", categoryColor: "green" },
    { id: 3, department: "Electrical Engineering", announcement: "Workshop on IoT and Smart Devices this Friday.", date: "Nov 5, 2025", category: "Event", categoryColor: "yellow" },
    { id: 4, department: "Software Engineering", announcement: "Group project deadline extended to Nov 15.", date: "Nov 4, 2025", category: "Notice", categoryColor: "blue" },
  ];

  // Typing effect
  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (textIndex.current >= fullText.length) {
        setDisplayedText("");
        textIndex.current = 0;
      } else {
        setDisplayedText((prev) => prev + fullText.charAt(textIndex.current));
        textIndex.current++;
      }
    }, typingSpeed);

    const cursorInterval = setInterval(() => setShowCursor((prev) => !prev), cursorBlinkSpeed);

    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-72 sm:w-96 h-72 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-[50%] left-[60%] w-72 sm:w-96 h-72 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-[80%] left-[10%] w-72 sm:w-96 h-72 sm:h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Header */}
      <Header isActive="/" />

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Welcome Card */}
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 text-center mt-6 sm:mt-10 mb-12 transform transition-all duration-500 hover:scale-[1.01]">
          <Image
            src="/images/clock.jpg"
            alt="Clock"
            width={160}
            height={160}
            className="h-32 w-32 sm:h-40 sm:w-40 mx-auto mb-6 rounded-full shadow-lg object-cover transition-all duration-300 hover:shadow-2xl hover:scale-105"
            priority
          />
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-blue-800 mb-6 min-h-[100px] whitespace-pre-wrap">
            {displayedText}
            <span className={`inline-block w-1 bg-blue-800 transition-opacity duration-500 ${showCursor ? "opacity-100" : "opacity-0"}`}>|</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 mb-8 sm:mb-10 animate-fade-in-up">
            Your centralized platform for managing and accessing academic schedules.
          </p>
        </div>

        {/* Departments Marquee */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">University Departments</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Scroll through our academic departments</p>
          </div>
          <div className="relative overflow-hidden mb-8">
            <div className="flex space-x-6 animate-marquee whitespace-nowrap">
              {[...departments, ...departments].map((dept, idx) => (
                <div key={`${dept.id}-${idx}`} className="inline-flex flex-shrink-0">
                  <Card shadow="lg" radius="lg" padding="lg" className="w-80 bg-white bg-opacity-80 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer">
                    <Card.Section className="p-6">
                      <Group justify="space-between" className="mb-4">
                        <Group>
                          <Avatar size="lg" radius="xl" color={dept.color} className="shadow-md">{dept.avatar}</Avatar>
                          <div className="text-left">
                            <Text size="xl" fw={700} className="text-gray-800">{dept.name}</Text>
                            <Text size="sm" color="dimmed" className="mt-1">Head: {dept.head}</Text>
                          </div>
                        </Group>
                      </Group>
                      <Progress value={dept.progress} color={dept.color} size="lg" radius="xl" className="my-4" />
                      <Group justify="space-between" className="mb-4">
                        <div className="flex items-center space-x-2">
                          <UsersIcon className="w-5 h-5 text-blue-500" />
                          <Text size="sm" className="text-gray-600"><span className="font-semibold text-gray-800">{dept.students}</span> Students</Text>
                        </div>
                        <div className="flex items-center space-x-2">
                          <AcademicCapIcon className="w-5 h-5 text-green-500" />
                          <Text size="sm" className="text-gray-600"><span className="font-semibold text-gray-800">{dept.instructors}</span> Instructors</Text>
                        </div>
                      </Group>
                    </Card.Section>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="text-center mb-8 mt-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Today’s Schedule</h3>
          </div>
          <div className="h-96 overflow-hidden relative bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl shadow-lg">
            <div className="animate-marquee-vertical whitespace-nowrap">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {todaySchedule.map((cls) => (
                  <Card key={cls.id} shadow="md" radius="lg" padding="md" className="bg-white bg-opacity-90 backdrop-blur-sm transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer mb-4">
                    <Group>
                      <Avatar size="md" radius="xl" color={cls.color} className="shadow-sm">{cls.instructor.charAt(0)}</Avatar>
                      <div className="flex-1">
                        <Text size="lg" fw={600} className="text-gray-800">{cls.className}</Text>
                        <Text size="sm" color="dimmed">{cls.instructor} • {cls.department}</Text>
                        <Text size="sm" fw={500} className="text-blue-600">{cls.start_time} - {cls.end_time}</Text>
                      </div>
                      <Badge color={cls.color} variant="filled">{cls.room}</Badge>
                    </Group>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Announcements */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">Recent Announcements</h3>
            <Text size="sm" className="text-gray-600">Stay updated with the latest news from each department</Text>
          </div>
          <div className="relative h-32 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
            <div className="animate-marquee whitespace-nowrap">
              <div className="flex items-center space-x-8 h-full px-4">
                {announcements.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 text-white bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 shadow-md hover:bg-white/20 transition-all duration-200 cursor-pointer">
                    <Avatar size="md" radius="xl" color="white" className="shadow-lg">
                      <Text size="sm" fw={700} className="text-blue-500">{item.department.charAt(0)}</Text>
                    </Avatar>
                    <div className="text-left max-w-xs">
                      <Text size="sm" fw={600} className="text-white truncate">{item.department}</Text>
                      <Text size="xs" className="text-blue-100 truncate">{item.announcement}</Text>
                      <Text size="xs" className="text-blue-200 mt-1">{item.date}</Text>
                    </div>
                    <Badge color={item.categoryColor} variant="filled" radius="sm" size="sm" className="uppercase">{item.category}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <Card shadow="md" radius="lg" padding="xl" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white mb-12 transform transition-all duration-500 hover:scale-[1.02]">
          <div className="text-center">
            <Text size="xl" fw={700} className="mb-2">University Overview</Text>
            <Text size="sm" className="opacity-90 mb-6">Total academic statistics across all departments</Text>
            <Group justify="space-between" className="mb-4">
              <div className="text-center">
                <Text size="2xl" fw={700}>{departments.reduce((sum, dept) => sum + dept.students, 0)}</Text>
                <Text size="sm" className="opacity-90">Total Students</Text>
              </div>
              <div className="text-center">
                <Text size="2xl" fw={700}>{departments.reduce((sum, dept) => sum + dept.instructors, 0)}</Text>
                <Text size="sm" className="opacity-90">Total Instructors</Text>
              </div>
              <div className="text-center">
                <Text size="2xl" fw={700}>{departments.length}</Text>
                <Text size="sm" className="opacity-90">Departments</Text>
              </div>
            </Group>
          </div>
        </Card>
      </main>

      {/* Floating Feedback Button */}
      <button
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 flex items-center gap-2 bg-blue-600 text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105 focus:outline-none z-50 text-sm sm:text-base"
        onClick={() => setShowFeedback(true)}
      >
        <ChatBubbleLeftEllipsisIcon className="w-4 h-4 sm:w-5 sm:h-5" /> Feedback
      </button>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}

      {/* Animations */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0,0) scale(1); }
          33% { transform: translate(30px,-50px) scale(1.1); }
          66% { transform: translate(-20px,20px) scale(0.9); }
        }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px);} to {opacity:1; transform:translateY(0);} }
        @keyframes marquee { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        @keyframes marquee-vertical { 0%{transform:translateY(0);} 100%{transform:translateY(-50%);} }
        .animate-blob { animation: blob 7s infinite; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee-vertical { animation: marquee-vertical 20s linear infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      <Footer />
    </div>
  );
};

export default ScheduleHomePage;
