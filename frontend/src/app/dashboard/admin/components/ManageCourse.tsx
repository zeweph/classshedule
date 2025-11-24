/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Badge,
  Group,
  Stack,
  LoadingOverlay,
  ThemeIcon,
  TextInput,
  NumberInput,
  Select,
  Button,
  ActionIcon,
  Modal,
  Alert,
  Grid,
  Paper,
  Container,
} from "@mantine/core";
import {
  IconBooks,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
  IconPlus,
  IconFilter,
  IconRefresh,
  IconSchool,
  IconCertificate,
  IconCategory,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { fetchCourses, updateCourse, deleteCourse, setEditingCourse } from "@/store/slices/coursesSlice";
import {
  selectCoursesWithDepartments,
  selectCoursesLoading,
  selectCoursesError,
  selectEditingCourse,
  selectSubmitting,
  selectCoursesCount,
} from "@/store/selectors/coursesSelectors";
import { Authentication, Found } from "@/app/auth/auth";

// Import AddCourseModal
import AddCourseModal from "./AddCourseModa";

const ManageCourse: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const courses = useAppSelector(selectCoursesWithDepartments);
  const loading = useAppSelector(selectCoursesLoading);
  const error = useAppSelector(selectCoursesError);
  const editingCourse = useAppSelector(selectEditingCourse);
  const submitting = useAppSelector(selectSubmitting);
  const coursesCount = useAppSelector(selectCoursesCount);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  
  // Form state for editing
  const [editForm, setEditForm] = useState({
    course_code: "",
    course_name: "",
    credit_hour: 1,
    category: "",
  });
  
  const categories = ['Major Course', 'Support Course', 'Common Course'];

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const checkAuth = async () => {
      const foundUser = await Found();
      setUser(foundUser);
    };
    checkAuth();
  }, []);

  if (user === null) {
    return <Authentication />;
  }

  // Handle edit course - Open modal
  const handleEditCourse = (course: any) => {
    dispatch(setEditingCourse(course));
    setEditForm({
      course_code: course.course_code,
      course_name: course.course_name,
      credit_hour: course.credit_hour,
      category: course.category,
    });
    openEditModal();
  };

  // Handle update course
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      await dispatch(updateCourse({
        ...editingCourse,
        course_code: editForm.course_code,
        course_name: editForm.course_name,
        credit_hour: editForm.credit_hour,
        category: editForm.category,
      })).unwrap();

      notifications.show({
        title: "Success!",
        message: "Course updated successfully",
        color: "teal",
        icon: <IconCheck size={18} />,
      });
      
      closeEditModal();
      dispatch(setEditingCourse(null));
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg || "Failed to update course",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  // Handle delete course confirmation
  const handleDeleteConfirm = (courseId: number) => {
    setCourseToDelete(courseId);
    openDeleteModal();
  };

  // Handle delete course
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      await dispatch(deleteCourse(courseToDelete)).unwrap();
      notifications.show({
        title: "Success!",
        message: "Course deleted successfully",
        color: "teal",
        icon: <IconCheck size={18} />,
      });
      closeDeleteModal();
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg || "Failed to delete course",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    closeEditModal();
    dispatch(setEditingCourse(null));
    setEditForm({
      course_code: "",
      course_name: "",
      credit_hour: 1,
      category: "",
    });
  };

  // Handle course added from modal
  const handleCourseAdded = () => {
    closeAddModal();
    dispatch(fetchCourses()); // Refresh the list
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(fetchCourses());
    notifications.show({
      title: "Refreshed!",
      message: "Course list updated",
      color: "blue",
      icon: <IconRefresh size={18} />,
    });
  };

  // Filter courses based on search term and category
  const filteredCourses = courses.filter(course =>
    (course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (categoryFilter ? course.category === categoryFilter : true)
  );

  // Calculate category counts
  const categoryCounts = categories.map(cat => ({
    category: cat,
    count: courses.filter(course => course.category === cat).length
  }));

  if (loading) {
    return (
      <Container size="xl" py="xl">
        <Card className="min-h-[500px] flex items-center justify-center border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <LoadingOverlay visible={loading} />
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <Title order={3} c="blue" mb="sm">Loading Courses</Title>
            <Text c="dimmed">Fetching your course catalog...</Text>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Paper 
          shadow="lg" 
          p="xl" 
          radius="xl"
          className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 border-0 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]" />
          <div className="relative z-10">
            <Group justify="space-between" wrap="nowrap">
              <Group>
                <ThemeIcon 
                  size={50} 
                  color="blue" 
                  variant="white" 
                  className="bg-white/20 backdrop-blur-sm"
                  radius="lg"
                >
                  <IconBooks size={26} />
                </ThemeIcon>
                <div>
                  <Title order={2} className="text-white font-bold">
                    Course Management
                  </Title>
                  <Text c="blue.1" size="lg" className="mt-1">
                    Manage and organize your academic course catalog
                  </Text>
                </div>
              </Group>
              <Group>
                <Badge 
                  color="blue" 
                  variant="white" 
                  size="xl" 
                  className="text-blue-700 font-bold px-4 py-2"
                >
                  {coursesCount} Course{coursesCount !== 1 ? 's' : ''}
                </Badge>
                <Button
                  leftSection={<IconPlus size={20} />}
                  onClick={openAddModal}
                  color="blue"
                  variant="white"
                  size="lg"
                  className="bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-lg"
                  radius="xl"
                >
                  Add Course
                </Button>
              </Group>
            </Group>
          </div>
        </Paper>

        {/* Stats and Filters Section */}
        <Grid gutter="xl">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Paper shadow="md" p="lg" radius="lg" withBorder className="border-blue-100">
              <Group justify="space-between" mb="md">
                <Text fw={700} size="lg" c="blue">Quick Search & Filters</Text>
                <Button
                  variant="light"
                  color="blue"
                  leftSection={<IconRefresh size={16} />}
                  onClick={handleRefresh}
                  size="sm"
                >
                  Refresh
                </Button>
              </Group>
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <TextInput
                    placeholder="Search by course code, name, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftSection={<IconSearch size={18} />}
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Select
                    placeholder="Filter by category"
                    value={categoryFilter}
                    onChange={setCategoryFilter}
                    data={categories.map(cat => ({ value: cat, label: cat }))}
                    clearable
                    leftSection={<IconFilter size={18} />}
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Paper shadow="md" p="lg" radius="lg" withBorder className="border-blue-100 bg-blue-50/50">
              <Text fw={700} size="lg" c="blue" mb="md">Category Overview</Text>
              <Stack gap="xs">
                {categoryCounts.map(({ category, count }) => (
                  <Group key={category} justify="space-between">
                    <Group gap="xs">
                      <IconCategory size={16} className="text-blue-600" />
                      <Text size="sm" c="dark">{category}</Text>
                    </Group>
                    <Badge color="blue" variant="light" size="sm">
                      {count}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>

        {error && (
          <Alert 
            icon={<IconAlertCircle size={24} />} 
            title="Error Loading Courses" 
            color="red" 
            variant="light"
            className="rounded-xl border-2 border-red-200"
            radius="lg"
          >
            <Text className="text-sm">{error}</Text>
          </Alert>
        )}

        {/* Courses Table */}
        <Paper 
          shadow="lg" 
          radius="xl" 
          withBorder 
          className="border-blue-100 overflow-hidden bg-white"
        >
          {filteredCourses.length === 0 ? (
            <div className="text-center py-16">
              <ThemeIcon size={80} color="blue" variant="light" className="mb-6 mx-auto" radius="xl">
                <IconSchool size={40} />
              </ThemeIcon>
              <Title order={3} c="dimmed" mb="xs">
                {searchTerm || categoryFilter ? "No matching courses found" : "No courses available"}
              </Title>
              <Text c="dimmed" size="md" mb="lg">
                {searchTerm || categoryFilter ? "Try adjusting your search or filter criteria" : "Get started by adding your first course"}
              </Text>
              {!searchTerm && !categoryFilter && (
                <Button 
                  leftSection={<IconPlus size={20} />} 
                  onClick={openAddModal}
                  size="lg"
                  color="blue"
                  radius="xl"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg"
                >
                  Add First Course
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <Group justify="space-between">
                  <Text fw={700} size="lg" c="white">
                    Course Catalog
                  </Text>
                  <Badge color="blue" variant="filled" className="text-blue-700">
                    {filteredCourses.length} of {coursesCount} courses
                  </Badge>
                </Group>
              </div>
              
              <div className="overflow-x-auto">
                <Table 
                  striped 
                  highlightOnHover 
                  className="min-w-full"
                  classNames={{
                    table: "rounded-lg overflow-hidden",
                    thead: "bg-blue-50/80",
                    th: "text-blue-700 font-bold py-4 text-sm border-b-2 border-blue-200",
                    td: "py-4 border-b border-blue-50 transition-colors duration-200",
                  }}
                >
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th className="text-left pl-8">Course Code</Table.Th>
                      <Table.Th className="text-left">Course Name</Table.Th>
                      <Table.Th className="text-center">Credits</Table.Th>
                      <Table.Th className="text-left">Category</Table.Th>
                      <Table.Th className="text-center pr-8">Actions</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {filteredCourses.map((course) => (
                      <Table.Tr 
                        key={course.course_id} 
                        className="hover:bg-blue-50/50 group cursor-pointer"
                      >
                        <Table.Td className="pl-8">
                          <Group gap="sm">
                            <ThemeIcon size="sm" color="blue" variant="light" radius="md">
                              <IconCertificate size={14} />
                            </ThemeIcon>
                            <Text fw={600} className="text-blue-700 font-mono text-sm">
                              {course.course_code}
                            </Text>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Text className="text-gray-800 group-hover:text-blue-900 transition-colors">
                            {course.course_name}
                          </Text>
                        </Table.Td>
                        <Table.Td className="text-center">
                          <Badge 
                            color="blue" 
                            variant="light" 
                            size="lg"
                            className="font-semibold"
                          >
                            {course.credit_hour} credit{course.credit_hour !== 1 ? 's' : ''}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge 
                            color={
                              course.category === 'Major Course' ? 'blue' :
                              course.category === 'Support Course' ? 'indigo' : 'violet'
                            }
                            variant="outline" 
                            size="md"
                            className="font-medium"
                          >
                            {course.category}
                          </Badge>
                        </Table.Td>
                        <Table.Td className="pr-8">
                          <Group gap="xs" justify="center">
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="lg"
                              onClick={() => handleEditCourse(course)}
                              className="hover:scale-110 transition-all duration-200 hover:bg-blue-100"
                              radius="md"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon
                              variant="light"
                              color="red"
                              size="lg"
                              onClick={() => handleDeleteConfirm(course.course_id)}
                              className="hover:scale-110 transition-all duration-200 hover:bg-red-100"
                              radius="md"
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </div>
            </>
          )}
        </Paper>

        {/* Edit Course Modal */}
        <Modal
          opened={editModalOpened}
          onClose={handleCancelEdit}
          title={
            <Group>
              <IconEdit size={24} className="text-blue-600" />
              <Text fw={700} size="xl">Edit Course</Text>
            </Group>
          }
          size="lg"
          centered
          radius="xl"
          overlayProps={{
            backgroundOpacity: 0.55,
            blur: 3,
          }}
        >
          <form onSubmit={handleUpdateCourse}>
            <Stack gap="lg">
              <Grid gutter="lg">
                <Grid.Col span={12}>
                  <TextInput
                    label="Course Code"
                    placeholder="e.g., CS101"
                    value={editForm.course_code}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course_code: e.target.value }))}
                    required
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200",
                      label: "font-semibold text-blue-700"
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Course Name"
                    placeholder="e.g., Introduction to Computer Science"
                    value={editForm.course_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, course_name: e.target.value }))}
                    required
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200",
                      label: "font-semibold text-blue-700"
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Credit Hours"
                    value={editForm.credit_hour}
                    onChange={(value) => setEditForm(prev => ({ ...prev, credit_hour: Number(value) }))}
                    min={1}
                    max={10}
                    required
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 text-center transition-all duration-200",
                      label: "font-semibold text-blue-700"
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Category"
                    value={editForm.category}
                    onChange={(value) => setEditForm(prev => ({ ...prev, category: value || '' }))}
                    data={categories.map(cate => ({
                      value: cate,
                      label: cate,
                    }))}
                    required
                    size="md"
                    classNames={{
                      input: "border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200/50 transition-all duration-200",
                      label: "font-semibold text-blue-700"
                    }}
                  />
                </Grid.Col>
              </Grid>

              <Group justify="flex-end" mt="md">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  size="md"
                  radius="xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="blue"
                  loading={submitting}
                  leftSection={<IconCheck size={18} />}
                  size="md"
                  radius="xl"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg"
                >
                  Update Course
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
          title={
            <Group>
              <IconAlertCircle size={24} className="text-red-600" />
              <Text fw={700} size="xl">Confirm Deletion</Text>
            </Group>
          }
          centered
          size="sm"
          radius="xl"
        >
          <Stack>
            <Text>
              Are you sure you want to delete this course? This action cannot be undone and will remove all associated data.
            </Text>
            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={closeDeleteModal}
                radius="xl"
              >
                Cancel
              </Button>
              <Button
                color="red"
                onClick={handleDeleteCourse}
                loading={submitting}
                leftSection={<IconTrash size={16} />}
                radius="xl"
                className="bg-gradient-to-r from-red-600 to-red-700"
              >
                Delete Course
              </Button>
            </Group>
          </Stack>
        </Modal>

        {/* Add Course Modal */}
        <AddCourseModal
          opened={addModalOpened}
          onClose={closeAddModal}
          onCourseAdded={handleCourseAdded}
        />
      </Stack>
    </Container>
  );
};

export default ManageCourse;