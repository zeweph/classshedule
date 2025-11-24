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
} from "@mantine/core";
import {
  IconBooks,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconSearch,
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

const ShowCourse: React.FC = () => {
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
  const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null);
  // Departments from Redux store
  // Form state for editing
  const [editForm, setEditForm] = useState({
    course_code: "",
    course_name: "",
    credit_hour: 1,
    category: "",
  });
  const category=['Major Course','Support Course','Common Course'];

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
     // Not logged in → show authentication page
     return <Authentication />;
   }


  // Handle edit course
  const handleEditCourse = (course: any) => {
    dispatch(setEditingCourse(course));
    setEditForm({
      course_code: course.course_code,
      course_name: course.course_name,
      credit_hour: course.credit_hour,
      category: course.category,
    });
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
    } catch (error) {
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : JSON.stringify(error as any);
      notifications.show({
        title: "Error",
        message: errMsg ||"Failed to update course",
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
        message: errMsg ||"Failed to delete course",
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    dispatch(setEditingCourse(null));
    setEditForm({
      course_code: "",
      course_name: "",
      credit_hour: 1,
      category: "",
    });
  };

  // Filter courses based on search term
  const filteredCourses = courses.filter(course =>
    course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Card className="min-h-[400px] flex items-center justify-center">
        <LoadingOverlay visible={loading} />
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Text c="dimmed">Loading courses...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Header Section */}
      <Card 
        shadow="sm" 
        padding="lg" 
        radius="lg" 
        withBorder
        className="border-green-100 bg-gradient-to-br from-green-50/50 to-white"
      >
        <Card.Section withBorder inheritPadding py="md" className="bg-gradient-to-r from-green-500 to-emerald-500">
          <Group justify="space-between" wrap="nowrap">
            <Group>
              <ThemeIcon size={32} color="white" variant="transparent">
                <IconBooks size={20} />
              </ThemeIcon>
              <div>
                <Title order={3} className="text-white">
                  All Courses
                </Title>
                <Text c="white" size="sm" opacity={0.9}>
                  Manage and view all available courses
                </Text>
              </div>
            </Group>
            <Badge color="white" variant="filled" size="lg" className="text-green-600">
              {coursesCount} course{coursesCount !== 1 ? 's' : ''}
            </Badge>
          </Group>
        </Card.Section>

        {/* Search and Stats */}
        <Grid gutter="md" mt="md">
          <Grid.Col span={{ base: 12, md: 6 }}>
            <TextInput
              placeholder="Search courses by code, name, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftSection={<IconSearch size={16} />}
              size="md"
              classNames={{
                input: "border-2 border-green-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200",
              }}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Group justify="flex-end" gap="xs">
              <Badge color="blue" variant="light">
                Total: {coursesCount}
              </Badge>
              <Badge color="green" variant="light">
                Displayed: {filteredCourses.length}
              </Badge>
            </Group>
          </Grid.Col>
        </Grid>
      </Card>

      {error && (
        <Alert 
          icon={<IconAlertCircle size={20} />} 
          title="Error" 
          color="red" 
          variant="light"
          className="rounded-xl border-2"
        >
          <Text className="text-sm">{error}</Text>
        </Alert>
      )}

      {/* Courses Table */}
      <Card 
        shadow="sm" 
        padding={0} 
        radius="lg" 
        withBorder 
        className="border-green-100 overflow-hidden"
      >
        {filteredCourses.length === 0 ? (
          <Card.Section py="xl">
            <div className="text-center">
              <ThemeIcon size={48} color="gray" variant="light" className="mb-4 mx-auto">
                <IconBooks size={24} />
              </ThemeIcon>
              <Title order={4} c="dimmed" mb="xs">
                {searchTerm ? "No matching courses found" : "No courses available"}
              </Title>
              <Text c="dimmed" size="sm">
                {searchTerm ? "Try adjusting your search terms" : "Add your first course to get started"}
              </Text>
            </div>
          </Card.Section>
        ) : (
          <Card.Section py="md" className="bg-white">
            <div className="overflow-x-auto">
              <Table 
                striped 
                highlightOnHover 
                className="min-w-full"
                classNames={{
                  table: "rounded-lg overflow-hidden",
                  thead: "bg-gradient-to-r from-green-500 to-emerald-500",
                  th: "text-white font-bold py-4 text-sm border-0",
                  td: "py-4 border-b border-gray-100",
                }}
              >
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th className="text-left text-white pl-6">Course Code</Table.Th>
                    <Table.Th className="text-left text-white">Course Name</Table.Th>
                    <Table.Th className="text-center text-white">Credits</Table.Th>
                    <Table.Th className="text-left text-white">Category</Table.Th>
                    <Table.Th className="text-center text-white pr-6">Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredCourses.map((course) => (
                    <Table.Tr 
                      key={course.course_id} 
                      className={`
                        transition-all duration-200
                        ${editingCourse?.course_id === course.course_id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'hover:bg-green-50/50'}
                      `}
                    >
                      {/* View Mode */}
                      {editingCourse?.course_id !== course.course_id ? (
                        <>
                          <Table.Td>
                            <Text fw={600} className="text-green-700 font-mono text-sm">
                              {course.course_code}
                            </Text>
                          </Table.Td>
                          <Table.Td>
                            <Text className="text-gray-800">{course.course_name}</Text>
                          </Table.Td>
                          <Table.Td className="text-center">
                            <Badge color="blue" variant="light" size="md">
                              {course.credit_hour} credit{course.credit_hour !== 1 ? 's' : ''}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Badge color="grape" variant="outline" size="sm">
                              {course.category}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" justify="center">
                              <ActionIcon
                                variant="light"
                                color="blue"
                                size="lg"
                                onClick={() => handleEditCourse(course)}
                                className="hover:scale-110 transition-transform"
                              >
                                <IconEdit size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="light"
                                color="red"
                                size="lg"
                                onClick={() => handleDeleteConfirm(course.course_id)}
                                className="hover:scale-110 transition-transform"
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </>
                      ) : (
                        /* Edit Mode */
                        <>
                          <Table.Td>
                            <TextInput
                              value={editForm.course_code}
                              onChange={(e) => setEditForm(prev => ({ ...prev, course_code: e.target.value }))}
                              size="sm"
                              classNames={{
                                input: "border-2 border-blue-200 rounded-lg focus:border-blue-500",
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <TextInput
                              value={editForm.course_name}
                              onChange={(e) => setEditForm(prev => ({ ...prev, course_name: e.target.value }))}
                              size="sm"
                              classNames={{
                                input: "border-2 border-blue-200 rounded-lg focus:border-blue-500",
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <NumberInput
                              value={editForm.credit_hour}
                              onChange={(value) => setEditForm(prev => ({ ...prev, credit_hour: Number(value) }))}
                              min={1}
                              max={10}
                              size="sm"
                              classNames={{
                                input: "border-2 border-blue-200 rounded-lg focus:border-blue-500 text-center",
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Select
                              value={editForm.category}
                              onChange={(value) => setEditForm(prev => ({ ...prev, department_id: value || '' }))}
                              data={category.map(cate => ({
                                value: cate,
                                label: cate,
                              }))}
                              size="sm"
                              classNames={{
                                input: "border-2 border-blue-200 rounded-lg focus:border-blue-500",
                              }}
                            />
                          </Table.Td>
                          <Table.Td>
                            <Group gap="xs" justify="center">
                              <ActionIcon
                                variant="filled"
                                color="green"
                                size="lg"
                                onClick={handleUpdateCourse}
                                loading={submitting}
                                className="hover:scale-110 transition-transform"
                              >
                                <IconCheck size={16} />
                              </ActionIcon>
                              <ActionIcon
                                variant="filled"
                                color="gray"
                                size="lg"
                                onClick={handleCancelEdit}
                                className="hover:scale-110 transition-transform"
                              >
                                <IconX size={16} />
                              </ActionIcon>
                            </Group>
                          </Table.Td>
                        </>
                      )}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </div>
          </Card.Section>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpened}
        onClose={closeDeleteModal}
        title="Delete Course"
        centered
        size="sm"
        radius="lg"
      >
        <Stack>
          <Text>
            Are you sure you want to delete this course? This action cannot be undone.
          </Text>
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button
              color="red"
              onClick={handleDeleteCourse}
              loading={submitting}
              leftSection={<IconTrash size={16} />}
            >
              Delete Course
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ShowCourse;