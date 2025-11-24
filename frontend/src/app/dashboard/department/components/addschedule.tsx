/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Button,
  Stack,
  Container,
  Grid,
  Select,
  TextInput,
  Badge,
  LoadingOverlay,
  Alert,
  Paper,
  ThemeIcon,
  SimpleGrid,
  Box,
  ActionIcon,
  Modal,
  Avatar,
  Progress,
  Divider,
  Menu,
  Tabs,
  Accordion,
  Switch,
  Tooltip,
} from "@mantine/core";
import {
  IconCalendar,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconSearch,
  IconCalendarTime,
  IconBooks,
  IconUsers,
  IconBuilding,
  IconClock,
  IconSchool,
  IconSection,
  IconCalendarEvent,
  IconDotsVertical,
  IconCopy,
  IconEye,
  IconFilter,
  IconMapPin,
  IconBuildingCommunity,
  IconStairs,
  IconDoor,
  IconWorldUpload,
  IconWorldDownload,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchSchedules,
  fetchInstructors,
  fetchCourses,
  fetchRooms,
  fetchSession,
  fetchRoomHierarchy,
  fetchTodaySchedule,
  saveSchedule,
  updateSchedule,
  deleteSchedule,
  toggleScheduleStatus,
  setBatch,
  setSemester,
  setSection,
  setDay,
  setCourses,
  addCourse,
  removeCourse,
  updateCourse,
  addDaySchedule,
  removeDaySchedule,
  resetForm,
  setEditingSchedule,
} from "@/store/slices/scheduleSlice";
import {
  selectSchedules,
  selectCurrentSchedule,
  selectInstructors,
  selectCourses,
  selectRooms,
  selectSession,
  selectLoading,
  selectSubmitting,
  selectError,
  selectRoomHierarchy,
  selectTodaySchedules,
  selectTodayLoading,
} from "@/store/selectors/scheduleSelectors";
import { Authentication, Found } from "@/app/auth/auth";

const ScheduleDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const schedules = useAppSelector(selectSchedules);
  const currentSchedule = useAppSelector(selectCurrentSchedule);
  const instructors = useAppSelector(selectInstructors);
  const courses = useAppSelector(selectCourses);
  const rooms = useAppSelector(selectRooms);
  const session = useAppSelector(selectSession) as any;
  const loading = useAppSelector(selectLoading);
  const submitting = useAppSelector(selectSubmitting);
  const error = useAppSelector(selectError);
  const roomHierarchy = useAppSelector(selectRoomHierarchy);
  const todaySchedules = useAppSelector(selectTodaySchedules);
  const todayLoading = useAppSelector(selectTodayLoading);

  // Local state
  const [activeTab, setActiveTab] = useState<string>("schedules");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [semesterFilter, setSemesterFilter] = useState<string>("all");
  const [blockFilter, setBlockFilter] = useState<string>("all");
  const [roomTypeFilter, setRoomTypeFilter] = useState<string>("all");
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [publishModalOpened, { open: openPublishModal, close: closePublishModal }] = useDisclosure(false);
  const [roomModalOpened, { open: openRoomModal, close: closeRoomModal }] = useDisclosure(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null);
  const [scheduleToPublish, setScheduleToPublish] = useState<any>(null);
  const [editingSchedule, setEditingScheduleState] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [publishLoading, setPublishLoading] = useState<string | null>(null);

  const years = ["First year", "Second year", "Third Year", "Fourth Year"];
  const semesters = ["First", "Second", "Summer"];
  const roomTypes = ["classroom", "lab", "office", "conference", "library"];
  const colorPalette = [
    "#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
  ];
  const allDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

  // Fetch data
  useEffect(() => {
    dispatch(fetchSchedules());
    dispatch(fetchInstructors());
    dispatch(fetchCourses());
    dispatch(fetchRooms());
    dispatch(fetchSession());
    dispatch(fetchRoomHierarchy());
    dispatch(fetchTodaySchedule());
  }, [dispatch]);

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      const foundUser = await Found();
      setUser(foundUser);
    };
    checkAuth();
  }, []);

  // Filter schedules based on department and filters
  const departmentSchedules = schedules.filter(schedule => 
    !user?.department_id || schedule.department_id === user.department_id
  );

  const filteredSchedules = departmentSchedules.filter(sched => {
    const matchesSearch = sched.batch.toString().includes(searchTerm) ||
      sched.semester.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sched.section.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sched.status === statusFilter;
    const matchesBatch = batchFilter === "all" || sched.batch === batchFilter;
    const matchesSemester = semesterFilter === "all" || sched.semester === semesterFilter;
    
    return matchesSearch && matchesStatus && matchesBatch && matchesSemester;
  });

  // Room options with hierarchy information
  const roomOptions = rooms.map((room: any) => ({
    value: room.room_id.toString(),
    label: `${room.block_code} - Floor ${room.floor_number} - ${room.room_number} (${room.room_type})`,
    capacity: room.capacity,
    facilities: room.facilities
  }));

  const instructorOptions = instructors.map((inst: any) => ({
    value: inst.id.toString(),
    label: inst.full_name,
  }));

  const courseOptions = courses.map((course: any) => ({
    value: course.course_id.toString(),
    label: `${course.course_code} - ${course.course_name}`,
  }));

  const sectionOptions = [
    { value: "", label: "Select Section" },
    { value: "1", label: "Single Class" },
    ...letters.map((letter) => ({
      value: letter,
      label: `Section ${letter}`,
    })),
  ];

  // Available days for current schedule
  const availableDays = allDays.filter(d => 
    !currentSchedule.days.some((s: any) => s.day_of_week === d)
  );

  // Handlers
  const handleAddCourse = () => {
    dispatch(addCourse());
  };

  const handleRemoveCourse = (index: number) => {
    dispatch(removeCourse(index));
  };

  const handleCourseChange = (index: number, field: string, value: any) => {
    dispatch(updateCourse({ index, field, value }));
  };

  const handleSaveDaySchedule = () => {
    if (!currentSchedule.day) {
      notifications.show({
        title: "Validation Error",
        message: "Please select a day",
        color: "red",
      });
      return;
    }

    // Validate courses
    for (const course of currentSchedule.courses) {
      if (!course.course_id || !course.instructor_id || !course.room_id) {
        notifications.show({
          title: "Validation Error",
          message: "Please fill all required fields for each course",
          color: "red",
        });
        return;
      }
    }

    const newDaySchedule = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      batch: currentSchedule.batch,
      semester: currentSchedule.semester,
      section: currentSchedule.section,
      department_id: user?.department_id,
      day_of_week: currentSchedule.day,
      courses: [...currentSchedule.courses],
    };

    dispatch(addDaySchedule(newDaySchedule));
    
    // Reset for next day
    dispatch(setDay(""));
    dispatch(setCourses([{
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      course_id: 0,
      room_id: 0,
      instructor_id: 0,
      startTime: "08:00",
      endTime: "09:00",
      color: colorPalette[0],
    }]));
  };

  const handleSubmit = async (publish: boolean = false) => {
    if (currentSchedule.days.length === 0) {
      notifications.show({
        title: "Validation Error",
        message: "Please add at least one day schedule",
        color: "red",
      });
      return;
    }

    try {
      const scheduleData = {
        batch: currentSchedule.batch,
        semester: currentSchedule.semester,
        section: currentSchedule.section,
        department_id: user?.department_id,
        schedule: currentSchedule.days,
      };

      if (isEditing && editingSchedule) {
        await dispatch(updateSchedule({ 
          scheduleId: editingSchedule.id, 
          scheduleData, 
          publish 
        })).unwrap();
        notifications.show({
          title: "Success!",
          message: `Schedule ${publish ? "published" : "updated"} successfully!`,
          color: "teal",
        });
      } else {
        await dispatch(saveSchedule({ scheduleData, publish })).unwrap();
        notifications.show({
          title: "Success!",
          message: `Schedule ${publish ? "published" : "saved as draft"} successfully!`,
          color: "teal",
        });
      }
      
      dispatch(fetchSchedules());
      handleResetForm();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to save schedule";
      notifications.show({
        title: "Error",
        message: errMsg,
        color: "red",
      });
    }
  };

  const handleEditSchedule = (schedule: any) => {
    setEditingScheduleState(schedule);
    setIsEditing(true);
    dispatch(setEditingSchedule(schedule));
    setActiveTab("create");
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await dispatch(deleteSchedule(scheduleId)).unwrap();
      notifications.show({
        title: "Success!",
        message: "Schedule deleted successfully",
        color: "teal",
      });
      closeDeleteModal();
      dispatch(fetchSchedules());
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg || "Failed to delete schedule",
        color: "red",
      });
    }
  };

  const handleTogglePublish = async (schedule: any) => {
    setPublishLoading(schedule.id);
    try {
      await dispatch(toggleScheduleStatus({ 
        scheduleId: schedule.id, 
        currentStatus: schedule.status 
      })).unwrap();
      
      notifications.show({
        title: "Success!",
        message: `Schedule ${schedule.status === "published" ? "unpublished" : "published"} successfully`,
        color: "teal",
      });
      
      dispatch(fetchSchedules());
      closePublishModal();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg || "Failed to update schedule status",
        color: "red",
      });
    } finally {
      setPublishLoading(null);
    }
  };

  const handleQuickPublish = async (schedule: any) => {
    setPublishLoading(schedule.id);
    try {
      await dispatch(toggleScheduleStatus({ 
        scheduleId: schedule.id, 
        currentStatus: schedule.status 
      })).unwrap();
      
      notifications.show({
        title: "Success!",
        message: `Schedule ${schedule.status === "published" ? "unpublished" : "published"} successfully`,
        color: "teal",
      });
      
      dispatch(fetchSchedules());
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg || "Failed to update schedule status",
        color: "red",
      });
    } finally {
      setPublishLoading(null);
    }
  };

  const handlePublishClick = (schedule: any) => {
    setScheduleToPublish(schedule);
    openPublishModal();
  };

  const handleResetForm = () => {
    dispatch(resetForm());
    setEditingScheduleState(null);
    setIsEditing(false);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setBatchFilter("all");
    setSemesterFilter("all");
    setBlockFilter("all");
    setRoomTypeFilter("all");
  };

  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || batchFilter !== "all" || semesterFilter !== "all";

  const progress = (currentSchedule.days.length / allDays.length) * 100;

  // Get status counts for filters
  const statusCounts = {
    all: departmentSchedules.length,
    draft: departmentSchedules.filter(s => s.status === "draft").length,
    published: departmentSchedules.filter(s => s.status === "published").length,
  };

  if (user === null) {
    return <Authentication />;
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Card 
          shadow="md" 
          padding="lg" 
          radius="lg" 
          withBorder
          className="border-blue-200 bg-gradient-to-br from-blue-50/80 to-cyan-50/80"
        >
          <Group justify="space-between" wrap="nowrap">
            <div>
              <Group>
                <ThemeIcon size={48} color="blue" variant="light" radius="lg">
                  <IconCalendarTime size={24} />
                </ThemeIcon>
                <div>
                  <Title order={2} className="text-blue-800">
                    Academic Schedule Management
                  </Title>
                  <Text c="dimmed" size="lg">
                    Manage schedules, rooms, and classes for {new Date().getFullYear()}
                  </Text>
                  {user?.department_name && (
                    <Badge color="blue" variant="light" size="sm" mt={4}>
                      Department: {user.department_name}
                    </Badge>
                  )}
                </div>
              </Group>
            </div>
            <Group>
              <Badge color="blue" variant="filled" size="xl" radius="sm">
                {departmentSchedules.length} Schedules
              </Badge>
              <Badge color="green" variant="filled" size="xl" radius="sm">
                {rooms.length} Rooms
              </Badge>
            </Group>
          </Group>
        </Card>

        {/* User Info Card */}
        {user && (
          <Card 
            shadow="sm" 
            padding="md" 
            radius="lg" 
            withBorder
            className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50"
          >
            <Group justify="space-between">
              <Group>
                <Avatar color="blue" radius="xl">
                  {user.full_name?.charAt(0).toUpperCase()}
                </Avatar>
                <div>
                  <Text fw={600} className="text-blue-800">
                    {user.full_name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {user.department_name} • {user.role}
                  </Text>
                </div>
              </Group>
              <Group>
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconBuildingCommunity size={16} />}
                  onClick={openRoomModal}
                  size="sm"
                >
                  View Rooms
                </Button>
                <Button
                  variant="light"
                  color="green"
                  leftSection={<IconRefresh size={16} />}
                  onClick={() => dispatch(fetchSchedules())}
                  loading={loading}
                  size="sm"
                >
                  Refresh
                </Button>
              </Group>
            </Group>
          </Card>
        )}

        {/* Today's Schedule Quick View */}
        {todaySchedules.length > 0 && (
          <Card 
            shadow="sm" 
            padding="lg" 
            radius="lg" 
            withBorder
            className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
          >
            <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-green-500 to-emerald-500">
              <Group justify="space-between">
                <Group>
                  <ThemeIcon size={32} color="white" variant="transparent">
                    <IconCalendar size={20} />
                  </ThemeIcon>
                  <Text fw={700} size="lg" className="text-white">
                    Today&apos;s Schedule
                  </Text>
                </Group>
                <Badge color="white" variant="filled" size="lg" className="text-green-600">
                  {todaySchedules.length} classes today
                </Badge>
              </Group>
            </Card.Section>

            <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md" mt="md">
              {todaySchedules.slice(0, 6).map((schedule) => (
                <Paper 
                  key={schedule.id} 
                  p="md" 
                  withBorder 
                  className="border-green-200 bg-white"
                  radius="lg"
                >
                  <Group justify="space-between" mb="sm">
                    <Text fw={600} className="text-green-700">
                      {schedule.course_name}
                    </Text>
                    <Badge color="blue" variant="light" size="sm">
                      {schedule.start_time} - {schedule.end_time}
                    </Badge>
                  </Group>
                  <Stack gap="xs">
                    <Group gap="xs">
                      <IconUsers size={14} className="text-gray-600" />
                      <Text size="sm">{schedule.instructor_name}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconMapPin size={14} className="text-gray-600" />
                      <Text size="sm">{schedule.location}</Text>
                    </Group>
                    <Group gap="xs">
                      <IconBuilding size={14} className="text-gray-600" />
                      <Text size="sm">{schedule.batch} - Sec {schedule.section}</Text>
                    </Group>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Card>
        )}

        {/* Main Tabs */}
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="lg" 
          withBorder
          className="border-purple-100 bg-gradient-to-br from-purple-50/30 to-pink-50/30"
        >
          <Tabs value={activeTab} onChange={setActiveTab}>
            <Tabs.List grow>
              <Tabs.Tab 
                value="schedules" 
                leftSection={<IconCalendarTime size={16} />}
              >
                Schedules ({departmentSchedules.length})
              </Tabs.Tab>
              <Tabs.Tab 
                value="create" 
                leftSection={<IconPlus size={16} />}
              >
                {isEditing ? "Edit Schedule" : "Create Schedule"}
              </Tabs.Tab>
              <Tabs.Tab 
                value="rooms" 
                leftSection={<IconBuilding size={16} />}
              >
                Room Management ({rooms.length})
              </Tabs.Tab>
              <Tabs.Tab 
                value="batch" 
                leftSection={<IconBuilding size={16} />}
              >
                Batch Management ({rooms.length})
              </Tabs.Tab>
            </Tabs.List>

            {/* Schedules Tab */}
            <Tabs.Panel value="schedules" pt="md">
              <Stack gap="md">
                {/* Filter Section */}
                <Card 
                  shadow="sm" 
                  padding="lg" 
                  radius="lg" 
                  withBorder
                  className="border-gray-200 bg-gray-50"
                >
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconFilter size={20} className="text-gray-600" />
                      <Text fw={500} size="lg">Filter & Search Schedules</Text>
                      <Badge color="blue" variant="light">
                        {statusCounts.published} Published • {statusCounts.draft} Draft
                      </Badge>
                    </Group>
                    <Group>
                      {hasActiveFilters && (
                        <Button 
                          variant="subtle" 
                          size="sm" 
                          onClick={clearFilters}
                          color="gray"
                        >
                          Clear All
                        </Button>
                      )}
                      <Text size="sm" c="dimmed">
                        {filteredSchedules.length} of {departmentSchedules.length} schedules
                      </Text>
                    </Group>
                  </Group>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <TextInput
                        placeholder="Search schedules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <Select
                        label="Status"
                        value={statusFilter}
                        onChange={(value) => setStatusFilter(value || "all")}
                        data={[
                          { value: "all", label: `All Status (${statusCounts.all})` },
                          { value: "draft", label: `Draft (${statusCounts.draft})` },
                          { value: "published", label: `Published (${statusCounts.published})` },
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <Select
                        label="Batch"
                        value={batchFilter}
                        onChange={(value) => setBatchFilter(value || "all")}
                        data={[
                          { value: "all", label: "All Batches" },
                          ...years.map(year => ({ value: year, label: year }))
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 2 }}>
                      <Select
                        label="Semester"
                        value={semesterFilter}
                        onChange={(value) => setSemesterFilter(value || "all")}
                        data={[
                          { value: "all", label: "All Semesters" },
                          ...semesters.map(sem => ({ value: sem, label: `${sem} Semester` }))
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 3 }}>
                      <Box style={{ paddingTop: '24px' }}>
                        {hasActiveFilters && (
                          <Group gap="xs" wrap="wrap">
                            {searchTerm && (
                              <Badge color="blue" variant="light" size="sm">
                                Search: &quot;{searchTerm}&quot;
                              </Badge>
                            )}
                            {statusFilter !== "all" && (
                              <Badge color="blue" variant="light" size="sm">
                                Status: {statusFilter}
                              </Badge>
                            )}
                            {batchFilter !== "all" && (
                              <Badge color="green" variant="light" size="sm">
                                Batch: {batchFilter}
                              </Badge>
                            )}
                            {semesterFilter !== "all" && (
                              <Badge color="orange" variant="light" size="sm">
                                Semester: {semesterFilter}
                              </Badge>
                            )}
                          </Group>
                        )}
                      </Box>
                    </Grid.Col>
                  </Grid>
                </Card>

                {/* Schedules List */}
                {loading ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <LoadingOverlay visible={loading} />
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                      <Text c="dimmed">Loading schedules...</Text>
                    </div>
                  </div>
                ) : filteredSchedules.length === 0 ? (
                  <div className="min-h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <ThemeIcon size={48} color="gray" variant="light" className="mb-4">
                        <IconCalendar size={24} />
                      </ThemeIcon>
                      <Title order={4} c="dimmed" mb="xs">
                        No schedules found
                      </Title>
                      <Text c="dimmed" size="sm">
                        {searchTerm ? "Try adjusting your search terms" : "Create your first schedule to get started"}
                      </Text>
                    </div>
                  </div>
                ) : (
                  <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                    {filteredSchedules.map((schedule) => (
                      <Paper 
                        key={schedule.id} 
                        p="lg" 
                        withBorder 
                        className={`border-2 ${
                          schedule.status === "published" 
                            ? "border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50" 
                            : "border-yellow-200 bg-gradient-to-br from-yellow-50/50 to-amber-50/50"
                        } hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                        radius="lg"
                      >
                        <Group justify="space-between" mb="sm">
                          <div>
                            <Text fw={600} className="text-purple-700 text-lg">
                              {schedule.batch}
                            </Text>
                            <Text size="sm" c="dimmed">
                              {schedule.semester} Semester • Section {schedule.section ==="1" ? "Single Class" : schedule.section}
                            </Text>
                          </div>
                          <Badge 
                            color={schedule.status === "published" ? "green" : "yellow"}
                            variant="light"
                            size="lg"
                            leftSection={
                              schedule.status === "published" ? 
                                <IconWorldUpload size={12} /> : 
                                <IconWorldDownload size={12} />
                            }
                          >
                            {schedule.status}
                          </Badge>
                        </Group>
                        
                        <Stack gap="sm" mb="md">
                          {schedule.days.slice(0, 3).map((day: any) => (
                            <Group key={day.id} justify="apart">
                              <Text size="sm" className="text-gray-600" fw={500}>
                                {day.day_of_week}
                              </Text>
                              <Badge color="blue" variant="light" size="sm">
                                {day.courses.length} courses
                              </Badge>
                            </Group>
                          ))}
                          {schedule.days.length > 3 && (
                            <Text size="sm" c="dimmed" className="text-center">
                              +{schedule.days.length - 3} more days
                            </Text>
                          )}
                        </Stack>

                        {/* Quick Publish/Unpublish Toggle */}
                        <Group justify="apart" mb="sm">
                          <Tooltip
                            label={schedule.status === "published" ? "Unpublish schedule" : "Publish schedule"}
                            position="top"
                          >
                            <Switch
                              checked={schedule.status === "published"}
                              onChange={() => handleQuickPublish(schedule)}
                              disabled={publishLoading === schedule.id}
                              size="md"
                              color="teal"
                              thumbIcon={
                                publishLoading === schedule.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                ) : schedule.status === "published" ? (
                                  <IconWorldUpload size={12} />
                                ) : (
                                  <IconWorldDownload size={12} />
                                )
                              }
                            />
                          </Tooltip>
                          <Text size="sm" c="dimmed">
                            {schedule.status === "published" ? "Published" : "Draft"}
                          </Text>
                        </Group>

                        <Divider my="sm" />

                        <Group justify="apart">
                          <Text size="xs" c="dimmed">
                            {new Date(schedule.created_at).toLocaleDateString()}
                          </Text>
                          <Menu position="bottom-end">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => handleEditSchedule(schedule)}
                              >
                                View & Edit
                              </Menu.Item>
                              <Menu.Item
                                leftSection={
                                  schedule.status === "published" ? 
                                    <IconWorldDownload size={14} /> : 
                                    <IconWorldUpload size={14} />
                                }
                                onClick={() => handlePublishClick(schedule)}
                                color={schedule.status === "published" ? "orange" : "green"}
                              >
                                {schedule.status === "published" ? "Unpublish" : "Publish"}
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                leftSection={<IconTrash size={14} />}
                                color="red"
                                onClick={() => {
                                  setScheduleToDelete(schedule.id);
                                  openDeleteModal();
                                }}
                              >
                                Delete
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Paper>
                    ))}
                  </SimpleGrid>
                )}
              </Stack>
            </Tabs.Panel>

            {/* Create/Edit Schedule Tab */}
            <Tabs.Panel value="create" pt="md">
              <Grid gutter="xl">
                {/* Left Sidebar - Basic Info */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                  <Stack gap="md">
                    <Card 
                      shadow="sm" 
                      padding="lg" 
                      radius="lg" 
                      withBorder
                      className="border-blue-100 sticky top-4 bg-gradient-to-br from-blue-50/50 to-white"
                    >
                      <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-blue-500 to-blue-600">
                        <Group>
                          <ThemeIcon size={32} color="white" variant="transparent">
                            <IconCalendarEvent size={20} />
                          </ThemeIcon>
                          <Text fw={700} size="lg" className="text-white">
                            {isEditing ? "Edit Schedule" : "Schedule Setup"}
                          </Text>
                        </Group>
                      </Card.Section>

                      <Stack gap="md" mt="md">
                        <Select
                          label="Batch Year"
                          placeholder="Select batch"
                          value={currentSchedule.batch}
                          onChange={(value) => dispatch(setBatch(value || ""))}
                          data={years.map(year => ({ value: year, label: year }))}
                          size="md"
                          leftSection={<IconSchool size={16} />}
                        />

                        <Select
                          label="Semester"
                          placeholder="Select semester"
                          value={currentSchedule.semester}
                          onChange={(value) => dispatch(setSemester(value || ""))}
                          data={semesters.map(sem => ({ value: sem, label: `${sem} Semester` }))}
                          size="md"
                          leftSection={<IconCalendar size={16} />}
                        />

                        {currentSchedule.batch && currentSchedule.semester && (
                          <Select
                            label="Section"
                            placeholder="Select section"
                            value={currentSchedule.section}
                            onChange={(value) => dispatch(setSection(value || ""))}
                            data={sectionOptions}
                            size="md"
                            leftSection={<IconSection size={16} />}
                          />
                        )}

                        {currentSchedule.section && availableDays.length > 0 && (
                          <Select
                            label="Day of Week"
                            placeholder="Select day"
                            value={currentSchedule.day}
                            onChange={(value) => dispatch(setDay(value || ""))}
                            data={availableDays.map(day => ({ value: day, label: day }))}
                            size="md"
                            leftSection={<IconCalendar size={16} />}
                          />
                        )}

                        {/* Progress */}
                        {currentSchedule.days.length > 0 && (
                          <Paper p="md" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                            <Group justify="apart" mb="xs">
                              <Text size="sm" fw={500}>Progress</Text>
                              <Text size="sm" c="dimmed">
                                {currentSchedule.days.length}/{allDays.length} days
                              </Text>
                            </Group>
                            <Progress value={progress} color="blue" size="lg" radius="xl" />
                          </Paper>
                        )}
                      </Stack>
                    </Card>

                    {/* Action Buttons */}
                    {currentSchedule.days.length > 0 && (
                      <Card 
                        shadow="sm" 
                        padding="lg" 
                        radius="lg" 
                        withBorder
                        className="border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                      >
                        <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-green-500 to-emerald-500">
                          <Text fw={700} size="lg" className="text-white text-center">
                            Ready to {isEditing ? "Update" : "Save"}
                          </Text>
                        </Card.Section>
                        <Stack gap="sm" mt="md">
                          <Button
                            onClick={() => handleSubmit(false)}
                            loading={submitting}
                            leftSection={<IconCheck size={16} />}
                            color="blue"
                            size="md"
                            fullWidth
                          >
                            {isEditing ? "Update Draft" : "Save as Draft"}
                          </Button>
                          <Button
                            onClick={() => handleSubmit(true)}
                            loading={submitting}
                            leftSection={<IconCheck size={16} />}
                            color="green"
                            size="md"
                            fullWidth
                          >
                            {isEditing ? "Publish Update" : "Publish Schedule"}
                          </Button>
                          <Button
                            variant="light"
                            onClick={handleResetForm}
                            size="md"
                            fullWidth
                          >
                            {isEditing ? "Cancel Edit" : "Reset All"}
                          </Button>
                        </Stack>
                      </Card>
                    )}
                  </Stack>
                </Grid.Col>

                {/* Main Content - Course Management */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                  <Stack gap="md">
                    {/* Course Management */}
                    {currentSchedule.day && (
                      <Card 
                        shadow="sm" 
                        padding="lg" 
                        radius="lg" 
                        withBorder
                        className="border-orange-100 bg-gradient-to-br from-orange-50/30 to-amber-50/30"
                      >
                        <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-orange-500 to-amber-500">
                          <Group justify="space-between">
                            <Group>
                              <ThemeIcon size={32} color="white" variant="transparent">
                                <IconBooks size={20} />
                              </ThemeIcon>
                              <div>
                                <Text fw={700} size="lg" className="text-white">
                                  Courses for {currentSchedule.day}
                                </Text>
                                <Text size="sm" c="white" opacity={0.9}>
                                  {currentSchedule.batch} • {currentSchedule.semester} Semester • Section {currentSchedule.section}
                                </Text>
                              </div>
                            </Group>
                            <Button
                              onClick={handleAddCourse}
                              leftSection={<IconPlus size={16} />}
                              color="white"
                              variant="light"
                              size="sm"
                            >
                              Add Course
                            </Button>
                          </Group>
                        </Card.Section>

                        <Stack gap="md" mt="md">
                          {currentSchedule.courses.map((course: any, index: number) => (
                            <Paper 
                              key={course.id} 
                              p="lg" 
                              withBorder 
                              className="border-orange-200 bg-gradient-to-br from-orange-50/50 to-yellow-50/50"
                              radius="lg"
                            >
                              <Group justify="space-between" mb="md">
                                <Group>
                                  <Box
                                    w={20}
                                    h={20}
                                    style={{ backgroundColor: course.color }}
                                    className="rounded-full border-2 border-white shadow-sm"
                                  />
                                  <Text fw={600} className="text-orange-700">
                                    Course {index + 1}
                                  </Text>
                                </Group>
                                <ActionIcon
                                  color="red"
                                  variant="light"
                                  onClick={() => handleRemoveCourse(index)}
                                  disabled={currentSchedule.courses.length <= 1}
                                  size="lg"
                                >
                                  <IconTrash size={16} />
                                </ActionIcon>
                              </Group>

                              <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                                <Select
                                  label="Course"
                                  placeholder="Select course"
                                  value={course.course_id ? course.course_id.toString() : null}
                                  onChange={(value) => handleCourseChange(index, "course_id", value ? parseInt(value) : 0)}
                                  data={courseOptions}
                                  size="sm"
                                  leftSection={<IconBooks size={16} />}
                                />

                                <Select
                                  label="Instructor"
                                  placeholder="Select instructor"
                                  value={course.instructor_id ? course.instructor_id.toString() : null}
                                  onChange={(value) => handleCourseChange(index, "instructor_id", value ? parseInt(value) : 0)}
                                  data={instructorOptions}
                                  size="sm"
                                  leftSection={<IconUsers size={16} />}
                                />

                                <Select
                                  label="Room"
                                  placeholder="Select room"
                                  value={course.room_id ? course.room_id.toString() : null}
                                  onChange={(value) => handleCourseChange(index, "room_id", value ? parseInt(value) : 0)}
                                  data={roomOptions}
                                  size="sm"
                                  leftSection={<IconBuilding size={16} />}
                                />

                                <TextInput
                                  label="Start Time"
                                  type="time"
                                  value={course.startTime}
                                  onChange={(e) => handleCourseChange(index, "startTime", e.target.value)}
                                  size="sm"
                                  leftSection={<IconClock size={16} />}
                                />

                                <TextInput
                                  label="End Time"
                                  type="time"
                                  value={course.endTime}
                                  onChange={(e) => handleCourseChange(index, "endTime", e.target.value)}
                                  size="sm"
                                  leftSection={<IconClock size={16} />}
                                />

                                <Select
                                  label="Color"
                                  value={course.color}
                                  onChange={(value) => handleCourseChange(index, "color", value || "#3b82f6")}
                                  data={colorPalette.map((color, idx) => ({ 
                                    value: color, 
                                    label: `Color ${idx + 1}`,
                                  }))}
                                  size="sm"
                                />
                              </SimpleGrid>
                            </Paper>
                          ))}

                          <Group justify="center" mt="md">
                            <Button
                              onClick={handleSaveDaySchedule}
                              leftSection={<IconCheck size={16} />}
                              color="orange"
                              size="md"
                              radius="lg"
                            >
                              Save This Day&apos;s Schedule
                            </Button>
                          </Group>
                        </Stack>
                      </Card>
                    )}

                    {/* Saved Days Preview */}
                    {currentSchedule.days.length > 0 && (
                      <Card 
                        shadow="sm" 
                        padding="lg" 
                        radius="lg" 
                        withBorder
                        className="border-green-100 bg-gradient-to-br from-green-50/30 to-emerald-50/30"
                      >
                        <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-green-500 to-emerald-500">
                          <Group justify="space-between">
                            <Group>
                              <ThemeIcon size={32} color="white" variant="transparent">
                                <IconCalendar size={20} />
                              </ThemeIcon>
                              <Text fw={700} size="lg" className="text-white">
                                Saved Days ({currentSchedule.days.length})
                              </Text>
                            </Group>
                            <Badge color="white" variant="filled" size="lg" className="text-green-600">
                              {Math.round(progress)}% Complete
                            </Badge>
                          </Group>
                        </Card.Section>

                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
                          {currentSchedule.days.map((daySchedule: any) => (
                            <Paper 
                              key={daySchedule.id} 
                              p="md" 
                              withBorder 
                              className="border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50"
                              radius="lg"
                            >
                              <Group justify="space-between" mb="sm">
                                <Text fw={600} className="text-green-700 flex items-center gap-2">
                                  <IconCalendar size={16} />
                                  {daySchedule.day_of_week}
                                </Text>
                                <Group gap="xs">
                                  <ActionIcon
                                    color="blue"
                                    variant="light"
                                    size="sm"
                                    onClick={() => {
                                      dispatch(setDay(daySchedule.day_of_week));
                                      dispatch(setCourses(daySchedule.courses));
                                      dispatch(removeDaySchedule(daySchedule.id));
                                    }}
                                  >
                                    <IconEdit size={14} />
                                  </ActionIcon>
                                  <ActionIcon
                                    color="red"
                                    variant="light"
                                    size="sm"
                                    onClick={() => dispatch(removeDaySchedule(daySchedule.id))}
                                  >
                                    <IconTrash size={14} />
                                  </ActionIcon>
                                </Group>
                              </Group>
                              <Stack gap="xs">
                                {daySchedule.courses.map((course: any, idx: number) => (
                                  <Group key={idx} justify="apart">
                                    <Group gap="xs">
                                      <Box
                                        w={12}
                                        h={12}
                                        style={{ backgroundColor: course.color }}
                                        className="rounded-full"
                                      />
                                      <Text size="sm" fw={500}>
                                        {courses.find((c: any) => c.course_id === course.course_id)?.course_name || "Unknown Course"}
                                      </Text>
                                    </Group>
                                    <Badge color="gray" variant="light" size="xs">
                                      {course.startTime} - {course.endTime}
                                    </Badge>
                                  </Group>
                                ))}
                              </Stack>
                            </Paper>
                          ))}
                        </SimpleGrid>
                      </Card>
                    )}

                    {/* Error Display */}
                    {error && (
                      <Alert 
                        icon={<IconX size={20} />} 
                        title="Error" 
                        color="red" 
                        variant="light"
                        className="rounded-xl border-2 border-red-200"
                      >
                        <Text className="text-sm">{error}</Text>
                      </Alert>
                    )}
                  </Stack>
                </Grid.Col>
              </Grid>
            </Tabs.Panel>

            {/* Rooms Tab */}
            <Tabs.Panel value="rooms" pt="md">
              <Stack gap="md">
                {/* Room Filters */}
                <Card 
                  shadow="sm" 
                  padding="lg" 
                  radius="lg" 
                  withBorder
                  className="border-gray-200 bg-gray-50"
                >
                  <Group justify="space-between" mb="md">
                    <Group gap="xs">
                      <IconFilter size={20} className="text-gray-600" />
                      <Text fw={500} size="lg">Filter Rooms</Text>
                    </Group>
                    <Button
                      variant="light"
                      color="blue"
                      leftSection={<IconBuildingCommunity size={16} />}
                      onClick={openRoomModal}
                    >
                      View Room Hierarchy
                    </Button>
                  </Group>

                  <Grid gutter="md">
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Select
                        label="Block"
                        value={blockFilter}
                        onChange={(value) => setBlockFilter(value || "all")}
                        data={[
                          { value: "all", label: "All Blocks" },
                          ...roomHierarchy.map((block: any) => ({
                            value: block.block_id.toString(),
                            label: `${block.block_name} (${block.block_code})`
                          }))
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <Select
                        label="Room Type"
                        value={roomTypeFilter}
                        onChange={(value) => setRoomTypeFilter(value || "all")}
                        data={[
                          { value: "all", label: "All Types" },
                          ...roomTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) }))
                        ]}
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="Search Rooms"
                        placeholder="Search by room number or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftSection={<IconSearch size={16} />}
                      />
                    </Grid.Col>
                  </Grid>
                </Card>

                {/* Rooms Grid */}
                <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="md">
                  {rooms.map((room: any) => (
                    <Paper 
                      key={room.room_id} 
                      p="lg" 
                      withBorder 
                      className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 hover:shadow-lg transition-all duration-200"
                      radius="lg"
                    >
                      <Group justify="space-between" mb="sm">
                        <div>
                          <Text fw={600} className="text-blue-700 text-lg">
                            {room.room_number}
                          </Text>
                          {room.room_name && (
                            <Text size="sm" c="dimmed">
                              {room.room_name}
                            </Text>
                          )}
                        </div>
                        <Badge 
                          color={room.is_available ? "green" : "red"}
                          variant="light"
                          size="sm"
                        >
                          {room.is_available ? "Available" : "Occupied"}
                        </Badge>
                      </Group>

                      <Stack gap="xs" mb="md">
                        <Group gap="xs">
                          <IconBuildingCommunity size={14} className="text-gray-600" />
                          <Text size="sm">{room.block_name} ({room.block_code})</Text>
                        </Group>
                        <Group gap="xs">
                          <IconStairs size={14} className="text-gray-600" />
                          <Text size="sm">Floor {room.floor_number}{room.floor_name ? ` (${room.floor_name})` : ''}</Text>
                        </Group>
                        <Group gap="xs">
                          <IconDoor size={14} className="text-gray-600" />
                          <Text size="sm">{room.room_type}</Text>
                        </Group>
                        {room.capacity && (
                          <Group gap="xs">
                            <IconUsers size={14} className="text-gray-600" />
                            <Text size="sm">Capacity: {room.capacity} people</Text>
                          </Group>
                        )}
                      </Stack>

                      {room.facilities && room.facilities.length > 0 && (
                        <div>
                          <Text size="sm" fw={500} mb="xs">Facilities:</Text>
                          <Group gap="xs" wrap="wrap">
                            {room.facilities.map((facility: string, index: number) => (
                              <Badge key={index} color="blue" variant="light" size="xs">
                                {facility}
                              </Badge>
                            ))}
                          </Group>
                        </div>
                      )}
                    </Paper>
                  ))}
                </SimpleGrid>
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Card>
      </Stack>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Schedule"
        centered
        size="sm"
        radius="lg"
      >
        <Stack>
          <Text>
            Are you sure you want to delete this schedule? This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={() => scheduleToDelete && handleDeleteSchedule(scheduleToDelete)}
              loading={submitting}
              leftSection={<IconTrash size={16} />}
            >
              Delete Schedule
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Publish/Unpublish Confirmation Modal */}
      <Modal
        opened={publishModalOpened}
        onClose={closePublishModal}
        title={scheduleToPublish?.status === "published" ? "Unpublish Schedule" : "Publish Schedule"}
        centered
        size="md"
        radius="lg"
      >
        <Stack>
          <Alert 
            color={scheduleToPublish?.status === "published" ? "orange" : "green"}
            variant="light"
            title={scheduleToPublish?.status === "published" ? "Unpublishing Schedule" : "Publishing Schedule"}
            icon={
              scheduleToPublish?.status === "published" ? 
                <IconWorldDownload size={20} /> : 
                <IconWorldUpload size={20} />
            }
          >
            <Text size="sm">
              {scheduleToPublish?.status === "published" 
                ? "Unpublishing will make this schedule unavailable to students and instructors. You can republish it anytime."
                : "Publishing will make this schedule available to students and instructors. Make sure all information is correct."
              }
            </Text>
          </Alert>

          {scheduleToPublish && (
            <Paper p="md" withBorder className="border-gray-200">
              <Text fw={500} mb="xs">Schedule Details:</Text>
              <Group justify="apart">
                <Text size="sm">Batch:</Text>
                <Text size="sm" fw={500}>{scheduleToPublish.batch}</Text>
              </Group>
              <Group justify="apart">
                <Text size="sm">Semester:</Text>
                <Text size="sm" fw={500}>{scheduleToPublish.semester}</Text>
              </Group>
              <Group justify="apart">
                <Text size="sm">Section:</Text>
                <Text size="sm" fw={500}>{scheduleToPublish.section}</Text>
              </Group>
              <Group justify="apart">
                <Text size="sm">Days:</Text>
                <Text size="sm" fw={500}>{scheduleToPublish.days.length}</Text>
              </Group>
            </Paper>
          )}

          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closePublishModal}>
              Cancel
            </Button>
            <Button
              color={scheduleToPublish?.status === "published" ? "orange" : "green"}
              onClick={() => scheduleToPublish && handleTogglePublish(scheduleToPublish)}
              loading={publishLoading === scheduleToPublish?.id}
              leftSection={
                scheduleToPublish?.status === "published" ? 
                  <IconWorldDownload size={16} /> : 
                  <IconWorldUpload size={16} />
              }
            >
              {scheduleToPublish?.status === "published" ? "Unpublish" : "Publish"} Schedule
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Room Hierarchy Modal */}
      <Modal
        opened={roomModalOpened}
        onClose={closeRoomModal}
        title="Room Hierarchy"
        size="xl"
        centered
        radius="lg"
      >
        <Accordion variant="separated" radius="md">
          {roomHierarchy.map((block) => (
            <Accordion.Item key={block.block_id} value={block.block_id.toString()}>
              <Accordion.Control>
                <Group>
                  <IconBuildingCommunity size={20} className="text-blue-600" />
                  <div>
                    <Text fw={600}>{block.block_name}</Text>
                    <Text size="sm" c="dimmed">{block.block_code} - {block.block_description}</Text>
                  </div>
                </Group>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack gap="md">
                  {block.floors.map((floor: any) => (
                    <Paper key={floor.floor_id} p="md" withBorder className="border-gray-200">
                      <Group justify="space-between" mb="sm">
                        <Group>
                          <IconStairs size={16} className="text-green-600" />
                          <Text fw={500}>Floor {floor.floor_number}</Text>
                          {floor.floor_name && (
                            <Text size="sm" c="dimmed">- {floor.floor_name}</Text>
                          )}
                        </Group>
                        <Badge color="blue" variant="light">
                          {floor.rooms.length} rooms
                        </Badge>
                      </Group>
                      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm">
                        {floor.rooms.map((room: any) => (
                          <Group key={room.room_id} justify="apart">
                            <Group gap="xs">
                              <IconDoor size={14} className="text-gray-600" />
                              <Text size="sm">{room.room_number}</Text>
                              {room.room_name && (
                                <Text size="sm" c="dimmed">- {room.room_name}</Text>
                              )}
                            </Group>
                            <Badge 
                              color={room.is_available ? "green" : "red"} 
                              variant="light" 
                              size="xs"
                            >
                              {room.room_type}
                            </Badge>
                          </Group>
                        ))}
                      </SimpleGrid>
                    </Paper>
                  ))}
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Modal>
    </Container>
  );
};

export default ScheduleDashboard;