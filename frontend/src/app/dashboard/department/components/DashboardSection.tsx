/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Grid,
  Container,
  Stack,
  ThemeIcon,
  Badge,
  Paper,
  Box,
  SimpleGrid,
  Loader,
  Alert,
  Center
} from "@mantine/core";
import {
  IconBooks,
  IconCalendar,
  IconChartBar,
  IconMessage,
  IconHelp,
  IconDashboard,
  IconArrowRight,
  IconUsers,
  IconAlertCircle,
  IconRefresh,
  IconUser,
} from "@tabler/icons-react";

// Redux Imports
import { Authentication, Found } from "@/app/auth/auth";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchTodaySchedule,
  fetchAnnouncements,
  refreshDashboardData,
  markAnnouncementAsRead,
  selectTodaySchedules,
  selectAnnouncements,
  selectUnreadAnnouncements,
  selectScheduleLoading,
  selectAnnouncementsLoading,
  selectDashboardLoading,
  selectDashboardError,
} from "@/store/slices/dashboardSlice";

interface Props {
  setActiveSection: (section: string) => void;
}

const DashboardSection: React.FC<Props> = ({ setActiveSection }) => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const todaySchedules = useAppSelector(selectTodaySchedules);
  const announcements = useAppSelector(selectAnnouncements);
  const unreadAnnouncements = useAppSelector(selectUnreadAnnouncements);
  const scheduleLoading = useAppSelector(selectScheduleLoading);
  const announcementsLoading = useAppSelector(selectAnnouncementsLoading);
  const dashboardLoading = useAppSelector(selectDashboardLoading);
  const error = useAppSelector(selectDashboardError);

  // Local state
  const [user, setUser] = useState<any>(null);

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchTodaySchedule());
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const foundUser = await Found();
      setUser(foundUser);
    };
    checkAuth();
  }, []);

  const handleRefresh = () => {
    dispatch(refreshDashboardData());
  };

  const handleAnnouncementClick = () => {
    setActiveSection("announcements");
    // Mark all unread announcements as read when navigating to announcements
    unreadAnnouncements.forEach(announcement => {
      dispatch(markAnnouncementAsRead(announcement.id));
    });
  };

  // Format time for display
  const formatTime = (timeString: string) => {
    try {
      return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.log("Error formatting time:", error);
      return timeString;
    }
  };

  // Get today's day name
  const getTodayDayName = () => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  };

  // Show authentication if not logged in
  if (user === null) {
    return <Authentication />;
  }

  // Show login prompt if no schedules (instructor specific check)
  if (todaySchedules.length < 0) {
    return (
      <Center className="min-h-[60vh]">
        <Card shadow="lg" radius="lg" p="xl" className="text-center">
          <ThemeIcon size={80} color="blue" variant="light" radius="xl" mb="md">
            <IconUser size={40} />
          </ThemeIcon>
          <Title order={2} mb="sm">Authentication Required</Title>
          <Text c="dimmed" mb="lg">Please log in to view instructor schedules</Text>
          <Button component="a" href="/login" size="lg">
            Go to Login
          </Button>
        </Card>
      </Center>
    );
  }

  const quickActions = [
    {
      key: "manageCourseAndInstructor",
      label: "My Courses",
      description: "Manage your courses and materials",
      icon: IconBooks,
      color: "blue",
      stats: `${todaySchedules.length} Classes Today`,
      path: "/courses",
    },
    {
      key: "manageSchedule",
      label: "My Schedule",
      description: "View and manage your timetable",
      icon: IconCalendar,
      color: "indigo",
      stats: `${todaySchedules.length} Today`,
    },
    {
      key: "reports",
      label: "Reports",
      description: "Analytics and performance",
      icon: IconChartBar,
      color: "purple",
      stats: "New Data",
    },
    {
      key: "submitFeedback",
      label: "Submit Feedback",
      description: "Share your thoughts",
      icon: IconMessage,
      color: "yellow",
      stats: "Help Improve",
    },
    {
      key: "helpSupport",
      label: "Help & Support",
      description: "Get assistance",
      icon: IconHelp,
      color: "red",
      stats: "24/7 Available",
    },
  ];

  const stats = [
    { 
      label: "Today's Classes", 
      value: todaySchedules.length.toString(), 
      icon: IconBooks, 
      color: "blue",
      loading: scheduleLoading
    },
    { 
      label: "Active Students", 
      value: "1,234", 
      icon: IconUsers, 
      color: "green" 
    },
    { 
      label: "Unread Announcements", 
      value: unreadAnnouncements.length.toString(), 
      icon: IconMessage, 
      color: "violet",
      loading: announcementsLoading
    },
    { 
      label: "Departments", 
      value: "8", 
      icon: IconDashboard, 
      color: "orange" 
    },
  ];

  // Get priority color for announcements
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      case 'low': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <Container size="xl" py="md" px="md">
      <Stack gap="lg">
        {/* Error Alert */}
        {error && (
          <Alert 
            color="red" 
            title="Error Loading Data" 
            icon={<IconAlertCircle size={20} />}
            withCloseButton
            onClose={() => dispatch({ type: 'dashboard/clearError' })}
          >
            {error}
          </Alert>
        )}

        {/* Welcome Header - Optimized for AppShell */}
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="lg" 
          withBorder
          className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-cyan-50/80"
        >
          <Group justify="space-between" wrap="nowrap" align="flex-start">
            <div className="flex-1">
              <Group align="center" mb="xs">
                <Title order={2} className="text-blue-800 font-bold">
                  🎓 Welcome Back, {user.full_name} 
                </Title>
                {dashboardLoading && (
                  <Loader size="sm" color="blue" />
                )}
              </Group>
              <Text c="dimmed" size="sm" className="max-w-2xl">
                Manage your academic activities, track progress, and access all department resources in one place.
              </Text>
            </div>
            <Group gap="sm">
              <Badge 
                color="blue" 
                variant="filled" 
                size="md" 
                radius="sm"
                className="hidden sm:block"
              >
                Academic Year 2024
              </Badge>
              <Button
                variant="light"
                color="blue"
                size="sm"
                onClick={handleRefresh}
                loading={dashboardLoading}
                leftSection={<IconRefresh size={16} />}
              >
                Refresh
              </Button>
            </Group>
          </Group>
        </Card>

        {/* Statistics Cards - Optimized spacing */}
        <SimpleGrid cols={{ base: 2, sm: 2, md: 4 }} spacing="md">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Paper
                key={index}
                p="md"
                radius="lg"
                withBorder
                className="border-gray-200 bg-white hover:shadow-md transition-all duration-200"
              >
                <Group justify="space-between">
                  <div>
                    {stat.loading ? (
                      <Loader size="sm" color={stat.color} />
                    ) : (
                      <Text fw={700} size="xl" className="text-gray-900">
                        {stat.value}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed" mt={2}>
                      {stat.label}
                    </Text>
                  </div>
                  <ThemeIcon
                    size={40}
                    color={stat.color}
                    variant="light"
                    radius="md"
                  >
                    <IconComponent size={20} />
                  </ThemeIcon>
                </Group>
              </Paper>
            );
          })}
        </SimpleGrid>

        {/* Quick Actions Grid - More compact */}
        <Card 
          shadow="sm" 
          padding="md" 
          radius="lg" 
          withBorder
          className="border-gray-100 bg-white"
        >
          <Card.Section withBorder inheritPadding py="sm" className="bg-gray-50">
            <Group justify="space-between">
              <Group gap="sm">
                <ThemeIcon size={28} color="blue" variant="light">
                  <IconDashboard size={16} />
                </ThemeIcon>
                <div>
                  <Title order={4} className="text-gray-800">
                    Quick Actions
                  </Title>
                </div>
              </Group>
              <Badge color="blue" variant="light" size="sm">
                {quickActions.length} Options
              </Badge>
            </Group>
          </Card.Section>

          <Grid gutter="md" mt="sm">
            {quickActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <Grid.Col key={action.key} span={{ base: 12, sm: 6, lg: 4 }}>
                  <Paper
                    p="md"
                    radius="md"
                    withBorder
                    className={`
                      border-${action.color}-200 bg-white
                      hover:shadow-md transition-all duration-200 cursor-pointer group
                      hover:border-${action.color}-300
                    `}
                    onClick={() => setActiveSection(action.key)}
                  >
                    <Group justify="space-between" align="flex-start" mb="xs">
                      <ThemeIcon
                        size={44}
                        color={action.color}
                        variant="light"
                        radius="lg"
                      >
                        <IconComponent size={20} />
                      </ThemeIcon>
                      <Badge 
                        color={action.color} 
                        variant="light" 
                        size="xs"
                      >
                        {action.stats}
                      </Badge>
                    </Group>

                    <Box>
                      <Title order={5} className="text-gray-800 mb-1">
                        {action.label}
                      </Title>
                      <Text c="dimmed" size="xs" className="mb-2">
                        {action.description}
                      </Text>
                    </Box>

                    <Group justify="space-between" mt="sm">
                      <Button
                        variant="subtle"
                        color={action.color}
                        size="xs"
                        rightSection={<IconArrowRight size={12} />}
                      >
                        Access
                      </Button>
                    </Group>
                  </Paper>
                </Grid.Col>
              );
            })}
          </Grid>
        </Card>

        {/* Recent Activity & Announcements - Side by side layout */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card 
              shadow="sm" 
              padding="md" 
              radius="lg" 
              withBorder
              className="border-green-100 bg-white"
            >
              <Card.Section withBorder inheritPadding py="sm" className="bg-green-50">
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon size={28} color="green" variant="light">
                      <IconCalendar size={16} />
                    </ThemeIcon>
                    <Text fw={600} size="sm" className="text-gray-800">
                      Today&apos;s Schedule ({getTodayDayName()})
                    </Text>
                  </Group>
                  {scheduleLoading && <Loader size="sm" color="green" />}
                </Group>
              </Card.Section>

              <Stack gap="sm" mt="sm">
                {scheduleLoading ? (
                  <Group justify="center" py="lg">
                    <Loader size="sm" color="green" />
                    <Text c="dimmed" size="sm">Loading schedule...</Text>
                  </Group>
                ) : todaySchedules.length > 0 ? (
                  todaySchedules.slice(0, 3).map((schedule) => (
                    <Paper key={schedule.id} p="sm" withBorder className="border-green-200 bg-white">
                      <Group justify="space-between">
                        <div>
                          <Text fw={600} size="sm" className="text-green-700">
                            {schedule.course_name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {schedule.instructor_name}
                          </Text>
                        </div>
                        <Badge color="green" variant="light" size="sm">
                          {schedule.room}
                        </Badge>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Paper p="lg" withBorder className="border-green-200 bg-white text-center">
                    <IconCalendar size={32} className="text-green-300 mx-auto mb-2" />
                    <Text fw={600} size="sm" className="text-green-700 mb-1">
                      No Classes Today
                    </Text>
                    <Text size="xs" c="dimmed">
                      Enjoy your free day!
                    </Text>
                  </Paper>
                )}
              </Stack>

              <Button
                variant="light"
                color="green"
                fullWidth
                mt="sm"
                size="sm"
                onClick={() => setActiveSection("viewSchedule")}
                rightSection={<IconArrowRight size={14} />}
              >
                View Full Schedule
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, lg: 6 }}>
            <Card 
              shadow="sm" 
              padding="md" 
              radius="lg" 
              withBorder
              className="border-orange-100 bg-white"
            >
              <Card.Section withBorder inheritPadding py="sm" className="bg-orange-50">
                <Group justify="space-between">
                  <Group gap="sm">
                    <ThemeIcon size={28} color="orange" variant="light">
                      <IconMessage size={16} />
                    </ThemeIcon>
                    <Text fw={600} size="sm" className="text-gray-800">
                      Announcements ({unreadAnnouncements.length} unread)
                    </Text>
                  </Group>
                  {announcementsLoading && <Loader size="sm" color="orange" />}
                </Group>
              </Card.Section>

              <Stack gap="sm" mt="sm">
                {announcementsLoading ? (
                  <Group justify="center" py="lg">
                    <Loader size="sm" color="orange" />
                    <Text c="dimmed" size="sm">Loading announcements...</Text>
                  </Group>
                ) : announcements.length > 0 ? (
                  announcements.slice(0, 3).map((announcement) => (
                    <Paper key={announcement.id} p="sm" withBorder className="border-orange-200 bg-white">
                      <Group justify="space-between" align="flex-start">
                        <div className="flex-1">
                          <Group gap="xs" mb={4}>
                            <Text fw={600} size="sm" className="text-orange-700">
                              {announcement.title}
                            </Text>
                            {!announcement.is_read && (
                              <Badge color="red" variant="light" size="xs">
                                New
                              </Badge>
                            )}
                          </Group>
                          <Text size="xs" c="dimmed" lineClamp={2}>
                            {announcement.message}
                          </Text>
                          <Text size="xs" c="dimmed" mt={2}>
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </Text>
                        </div>
                        <Badge 
                          color={getPriorityColor(announcement.priority)}
                          variant="light"
                          size="xs"
                        >
                          {announcement.priority}
                        </Badge>
                      </Group>
                    </Paper>
                  ))
                ) : (
                  <Paper p="lg" withBorder className="border-orange-200 bg-white text-center">
                    <IconMessage size={32} className="text-orange-300 mx-auto mb-2" />
                    <Text fw={600} size="sm" className="text-orange-700 mb-1">
                      No Announcements
                    </Text>
                    <Text size="xs" c="dimmed">
                      Check back later for updates
                    </Text>
                  </Paper>
                )}
              </Stack>

              <Button
                variant="light"
                color="orange"
                fullWidth
                mt="sm"
                size="sm"
                onClick={handleAnnouncementClick}
                rightSection={<IconArrowRight size={14} />}
              >
                View All Announcements
              </Button>
            </Card>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
};

export default DashboardSection;