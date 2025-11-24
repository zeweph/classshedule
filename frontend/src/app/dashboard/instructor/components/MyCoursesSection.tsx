/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Title,
  Text,
  Button,
  Group,
  Alert,
  Stack,
  Grid,
  Loader,
  Badge,
  Paper,
  ThemeIcon,
  Center,
  Box,
  Avatar,
  Divider,
  ScrollArea,
  Tooltip,
  Modal,
  ActionIcon,
} from "@mantine/core";
import {
  IconCalendar,
  IconUser,
  IconClock,
  IconMapPin,
  IconSchool,
  IconUsers,
  IconBuilding,
  IconAlertCircle,
  IconCoffee,
  IconChartBar,
  IconRefresh,
} from "@tabler/icons-react";
import { useAppDispatch, useInstructor } from "@/hooks/redux";
import {
  fetchInstructorSchedule,
  fetchInstructorInfo,
  clearScheduleError,
} from "@/store/slices/instructorsSlice";

const InstructorScheduleView: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    schedules, 
    scheduleLoading, 
    scheduleError, 
  } = useInstructor();
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [statsModalOpened, setStatsModalOpened] = useState(false);
  const [hasFetchedSchedule, setHasFetchedSchedule] = useState(false);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // Fetch current user session and automatically load schedule
  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/profile`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn) {
          setCurrentUser(data.user);
          
          // Auto-fetch schedule if user is an instructor
          if (data.user.role === 'instructor' && data.user.id) {
            await handleAutoFetchSchedule(data.user.id, data.user);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    }
  };

  const handleAutoFetchSchedule = async (instructorId: string, userData: any) => {
    dispatch(clearScheduleError());
    
    try {
      await Promise.all([
        dispatch(fetchInstructorSchedule(instructorId)),
        dispatch(fetchInstructorInfo(instructorId)),
      ]);
      setHasFetchedSchedule(true);
    } catch (error) {
      console.error('Failed to fetch instructor data:', error);
      setHasFetchedSchedule(true);
    }
  };

  const handleRefreshSchedule = async () => {
    if (currentUser?.id) {
      await handleAutoFetchSchedule(currentUser.id, currentUser);
    }
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      Monday: "blue",
      Tuesday: "teal", 
      Wednesday: "violet",
      Thursday: "orange",
      Friday: "red",
      Saturday: "indigo",
      Sunday: "pink",
    };
    return colors[day] || "gray";
  };

  const getTimeSlots = () => {
    const uniqueSlots = [...new Set(schedules.map(s => s.time_slot))].sort();
    return uniqueSlots.map(slot => {
      const firstSchedule = schedules.find(s => s.time_slot === slot);
      return {
        slot,
        start_time: firstSchedule?.start_time || '',
        end_time: firstSchedule?.end_time || '',
        isMorning: firstSchedule?.start_time ? parseInt(firstSchedule.start_time.split(':')[0]) < 12 : true
      };
    });
  };

  const getScheduleForTimeSlot = (day: string, timeSlot: string) => {
    return schedules.find(schedule => 
      schedule.day === day && schedule.time_slot === timeSlot
    );
  };

  const calculateStats = () => {
    const totalClasses = schedules.length;
    const classesPerDay = days.reduce((acc, day) => {
      acc[day] = schedules.filter(s => s.day === day).length;
      return acc;
    }, {} as any);
    
    const uniqueCourses = [...new Set(schedules.map(s => s.course_name))].length;
    const uniqueBatches = [...new Set(schedules.map(s => s.batch))].length;
    const uniqueSections = [...new Set(schedules.map(s => s.section))].length;
    
    const busiestDay = Object.keys(classesPerDay).reduce((a, b) => 
      classesPerDay[a] > classesPerDay[b] ? a : b, "Monday"
    );
    
    return {
      totalClasses,
      classesPerDay,
      uniqueCourses,
      uniqueBatches,
      uniqueSections,
      busiestDay,
    };
  };

  const stats = calculateStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading while checking authentication
  if (!currentUser && !hasFetchedSchedule) {
    return (
      <Center className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
        <Stack align="center" gap="lg">
          <Loader size="xl" color="blue" />
          <Text fw={600} size="lg">Loading...</Text>
          <Text c="dimmed">Checking authentication</Text>
        </Stack>
      </Center>
    );
  }

  // Show access denied if user is not an instructor
  if (currentUser && currentUser.role !== 'instructor') {
    return (
      <Center className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
        <Card shadow="lg" radius="lg" p="xl" className="text-center max-w-md">
          <ThemeIcon size={80} color="red" variant="light" radius="xl" mb="md">
            <IconAlertCircle size={40} />
          </ThemeIcon>
          <Title order={2} mb="sm" c="red">Access Denied</Title>
          <Text c="dimmed" mb="lg">
            This page is only accessible to instructors. 
            Your role is: <Badge color="blue" variant="light">{currentUser.role}</Badge>
          </Text>
          <Button component="a" href="/dashboard" size="lg">
            Go to Dashboard
          </Button>
        </Card>
      </Center>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
      <Container size="xl" className="py-8">
        {/* Header Section */}
        <Stack align="center" gap="md" mb={40}>
          <div className="relative">
            
            <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
          </div>
          
          <Stack gap="xs" align="center">
            <Title
              order={1}
              className="text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent text-center"
            >
              My Teaching Schedule
            </Title>
            <Text c="dimmed" size="xl" ta="center" fw={500}>
              Your personalized class timetable
            </Text>
          </Stack>
        </Stack>

        {/* Main Card */}
        <Card
          shadow="xl"
          radius="xl"
          padding="xl"
          className="bg-white/90 backdrop-blur-lg border border-white/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-50/50 to-transparent pointer-events-none"></div>

          <Stack gap="xl">
            {/* Instructor Profile Header */}
            <Paper
              radius="lg"
              p="lg"
              className="bg-gradient-to-r from-cyan-50/50 to-blue-50/50 border border-cyan-200/50 backdrop-blur-sm"
            >
              <Group justify="space-between" align="flex-start">
                <Group gap="lg">
                  <Avatar 
                    size={80} 
                    radius="xl"
                    color="cyan"
                    src={currentUser?.avatar}
                  >
                    <IconUser size={40} />
                  </Avatar>
                  <Stack gap="xs">
                    <Title order={2} className="text-2xl font-bold text-gray-900">
                      {currentUser?.full_name || 'Instructor'}
                    </Title>
                    <Group gap="md">
                      <Badge
                        variant="light"
                        color="blue"
                        leftSection={<IconUser size={14} />}
                        size="lg"
                      >
                        ID: {currentUser?.id_number}
                      </Badge>
                      <Badge
                        variant="light"
                        color="green"
                        leftSection={<IconBuilding size={14} />}
                        size="lg"
                      >
                        {currentUser?.department_name || 'Department'}
                      </Badge>
                      <Badge
                        variant="light"
                        color="violet"
                        leftSection={<IconSchool size={14} />}
                        size="lg"
                      >
                        Instructor
                      </Badge>
                    </Group>
                    {currentUser?.email && (
                      <Text c="dimmed" className="flex items-center gap-2">
                        📧 {currentUser.email}
                      </Text>
                    )}
                    <Text c="dimmed" size="sm">
                      Last updated: {formatDate(new Date().toISOString())}
                    </Text>
                  </Stack>
                </Group>
                
                <Group gap="xs">
                  <Tooltip label="View Schedule Statistics">
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconChartBar size={16} />}
                      onClick={() => setStatsModalOpened(true)}
                    >
                      Stats
                    </Button>
                  </Tooltip>
                  <Tooltip label="Refresh Schedule">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="lg"
                      onClick={handleRefreshSchedule}
                      loading={scheduleLoading}
                    >
                      <IconRefresh size={20} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>
            </Paper>

            {/* Quick Stats */}
            <Grid gutter="md">
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Paper p="md" radius="md" className="bg-blue-50/50 border border-blue-200 text-center hover:shadow-md transition-all">
                  <Text className="text-2xl font-bold text-blue-700">{stats.totalClasses}</Text>
                  <Text size="sm" c="blue" fw={500}>Total Classes</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Paper p="md" radius="md" className="bg-green-50/50 border border-green-200 text-center hover:shadow-md transition-all">
                  <Text className="text-2xl font-bold text-green-700">{stats.uniqueCourses}</Text>
                  <Text size="sm" c="green" fw={500}>Courses</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Paper p="md" radius="md" className="bg-violet-50/50 border border-violet-200 text-center hover:shadow-md transition-all">
                  <Text className="text-2xl font-bold text-violet-700">{stats.uniqueBatches}</Text>
                  <Text size="sm" c="violet" fw={500}>Batches</Text>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 6, sm: 3 }}>
                <Paper p="md" radius="md" className="bg-orange-50/50 border border-orange-200 text-center hover:shadow-md transition-all">
                  <Text className="text-2xl font-bold text-orange-700">{stats.uniqueSections}</Text>
                  <Text size="sm" c="orange" fw={500}>Sections</Text>
                </Paper>
              </Grid.Col>
            </Grid>

            {/* Error Alert */}
            {scheduleError && (
              <Alert
                color="red"
                title="Error Loading Schedule"
                icon={<IconAlertCircle size={20} />}
                radius="lg"
                variant="light"
                withCloseButton
                onClose={() => dispatch(clearScheduleError())}
              >
                {scheduleError}
              </Alert>
            )}

            {/* Schedule Content */}
            <Box mt="xl">
              {scheduleLoading ? (
                <Center py={80}>
                  <Stack align="center" gap="lg">
                    <Loader size="xl" color="blue" />
                    <Stack gap="xs" align="center">
                      <Text fw={600} size="lg">Loading your schedule...</Text>
                      <Text c="dimmed">Fetching your teaching timetable</Text>
                    </Stack>
                  </Stack>
                </Center>
              ) : schedules.length === 0 && hasFetchedSchedule ? (
                <Center py={80}>
                  <Stack align="center" gap="lg">
                    <ThemeIcon
                      size={120}
                      color="gray"
                      variant="light"
                      radius="xl"
                    >
                      <IconCalendar size={48} />
                    </ThemeIcon>
                    <Stack gap="xs" align="center">
                      <Title order={3} c="gray.7">
                        No Classes Scheduled
                      </Title>
                      <Text c="dimmed" ta="center" size="lg">
                        You don&apos;t have any classes scheduled for this period.
                      </Text>
                      <Button 
                        variant="light" 
                        leftSection={<IconRefresh size={16} />}
                        onClick={handleRefreshSchedule}
                      >
                        Refresh
                      </Button>
                    </Stack>
                  </Stack>
                </Center>
              ) : (
                <Paper
                  radius="lg"
                  p="md"
                  className="border border-gray-200/40 shadow-lg"
                >
                  <ScrollArea>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse min-w-[800px]">
                        <thead>
                          <tr className="bg-gradient-to-r from-gray-50 to-cyan-100/50">
                            <th className="border border-gray-200/60 px-6 py-4 text-left font-bold text-gray-700 sticky left-0 bg-cyan-50/80 backdrop-blur-sm">
                              <Group gap="xs">
                                <IconClock size={18} />
                                <Text>Time</Text>
                              </Group>
                            </th>
                            {days.map(day => (
                              <th
                                key={day}
                                className={`border border-gray-200/60 px-4 py-4 text-center font-bold text-gray-700 bg-${getDayColor(day)}-50/80 backdrop-blur-sm`}
                              >
                                <Stack gap={4} align="center">
                                  <Text>{day}</Text>
                                  <Badge
                                    size="sm"
                                    color={getDayColor(day)}
                                    variant="light"
                                  >
                                    {stats.classesPerDay[day] || 0} classes
                                  </Badge>
                                </Stack>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {getTimeSlots().map((timeSlot, index) => (
                            <tr
                              key={timeSlot.slot}
                              className={`border-b border-gray-200/50 ${
                                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                              } hover:bg-cyan-50/30 transition-colors duration-200`}
                            >
                              <td className="border border-gray-200/60 px-6 py-4 font-semibold bg-cyan-50/50 sticky left-0 backdrop-blur-sm">
                                <Stack gap="xs" align="center">
                                  <Text fw={700} size="sm">
                                    {timeSlot.start_time}
                                  </Text>
                                  <Text size="xs" c="dimmed">to</Text>
                                  <Text fw={700} size="sm">
                                    {timeSlot.end_time}
                                  </Text>
                                  <Badge
                                    size="sm"
                                    color={timeSlot.isMorning ? "blue" : "orange"}
                                    variant="light"
                                  >
                                    {timeSlot.isMorning ? "Morning" : "Afternoon"}
                                  </Badge>
                                </Stack>
                              </td>
                              {days.map(day => {
                                const schedule = getScheduleForTimeSlot(day, timeSlot.slot);
                                return (
                                  <td key={day} className="border border-gray-200/60 px-3 py-3">
                                    {schedule ? (
                                      <Card
                                        padding="md"
                                        radius="md"
                                        className={`border-l-4 border-${getDayColor(day)}-500 bg-${getDayColor(day)}-50/30 hover:shadow-md transition-all duration-300 cursor-pointer`}
                                      >
                                        <Stack gap="xs">
                                          <Badge
                                            color={getDayColor(day)}
                                            variant="light"
                                            size="xs"
                                          >
                                            {schedule.course_code}
                                          </Badge>
                                          <Text fw={700} size="sm" lineClamp={2}>
                                            {schedule.course_name}
                                          </Text>
                                          <Group gap="xs">
                                            <IconUsers size={0} />
                                            <Text size="sm" c="dimmed">
                                              {schedule.batch} - {schedule.semester} semester
                                            </Text>
                                          </Group>
                                          <Group gap="xs">
                                            <IconMapPin size={0} />
                                            <Badge
                                              size="sm"
                                              variant="light"
                                              color="gray"
                                            >
                                              {schedule.room}
                                            </Badge>
                                          </Group>
                                          <Group gap="xs">
                                            <Text size="xs" c="dimmed">
                                               {schedule.section !== "1" ? `Sec schedule.section` : ""}
                                            </Text>
                                          </Group>
                                        </Stack>
                                      </Card>
                                    ) : (
                                      <Center h={140}>
                                        <Text c="dimmed" size="sm" fw={500}>
                                          No Class
                                        </Text>
                                      </Center>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>

                  {/* Lunch Break Banner */}
                  <Paper
                    mt="md"
                    p="lg"
                    className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200"
                    radius="lg"
                  >
                    <Group justify="center" gap="lg">
                      <IconCoffee size={24} className="text-orange-500" />
                      <Stack gap={0} align="center">
                        <Text fw={700} size="lg" c="orange.7">
                          Lunch Break
                        </Text>
                        <Text size="sm" c="orange.6">
                          12:00 PM - 1:00 PM • Time to recharge
                        </Text>
                      </Stack>
                      <IconCoffee size={24} className="text-orange-500" />
                    </Group>
                  </Paper>
                </Paper>
              )}
            </Box>
          </Stack>
        </Card>
      </Container>

      {/* Statistics Modal */}
      <Modal
        opened={statsModalOpened}
        onClose={() => setStatsModalOpened(false)}
        title={
          <Group gap="xs">
            <IconChartBar size={20} />
            <Text fw={600}>Teaching Schedule Statistics</Text>
          </Group>
        }
        size="lg"
        radius="lg"
      >
        <Stack gap="lg">
          <Grid gutter="md">
            <Grid.Col span={6}>
              <Paper p="md" radius="md" className="bg-blue-50 text-center">
                <Text fw={700} size="xl" c="blue">{stats.totalClasses}</Text>
                <Text size="sm" c="blue">Total Classes</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="md" radius="md" className="bg-green-50 text-center">
                <Text fw={700} size="xl" c="green">{stats.uniqueCourses}</Text>
                <Text size="sm" c="green">Different Courses</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="md" radius="md" className="bg-violet-50 text-center">
                <Text fw={700} size="xl" c="violet">{stats.uniqueBatches}</Text>
                <Text size="sm" c="violet">Batches</Text>
              </Paper>
            </Grid.Col>
            <Grid.Col span={6}>
              <Paper p="md" radius="md" className="bg-orange-50 text-center">
                <Text fw={700} size="xl" c="orange">{stats.uniqueSections}</Text>
                <Text size="sm" c="orange">Sections</Text>
              </Paper>
            </Grid.Col>
          </Grid>

          <Divider />

          <div>
            <Text fw={600} mb="sm">Classes Distribution</Text>
            <Stack gap="xs">
              {days.map(day => (
                <Group key={day} justify="space-between">
                  <Text>{day}</Text>
                  <Badge color={getDayColor(day)} variant="light">
                    {stats.classesPerDay[day] || 0} classes
                  </Badge>
                </Group>
              ))}
            </Stack>
          </div>

          <Paper p="md" className="bg-cyan-50/50 border border-cyan-200">
            <Text fw={600} size="sm" c="cyan" mb="xs">Busiest Day</Text>
            <Text fw={700} size="lg" c="cyan.7">{stats.busiestDay}</Text>
            <Text size="sm" c="cyan.6">
              with {stats.classesPerDay[stats.busiestDay] || 0} classes
            </Text>
          </Paper>
        </Stack>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default InstructorScheduleView;