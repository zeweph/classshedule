/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import {
  Card,
  TextInput,
  NumberInput,
  Button,
  Group,
  Text,
  Alert,
  Select,
  Stack,
  Grid,
  Box,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconAlertCircle, IconBooks } from "@tabler/icons-react";

// Redux imports
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addCourse, clearError } from "@/store/slices/coursesSlice";

interface AddCourseModalProps {
  opened: boolean;
  onClose: () => void;
  onCourseAdded?: () => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ opened, onClose, onCourseAdded }) => {
  const dispatch = useAppDispatch();
  
  // Redux selectors
  const { submitting, error: coursesError } = useAppSelector((state) => state.courses);
  const category = ['Major Course', 'Support Course', 'Common Course'];
  
  const form = useForm({
    initialValues: {
      course_code: "",
      course_name: "",
      credit_hour: 1,
      category: ""
    },
    validate: {
      course_code: (value) => (value.length < 2 ? "Course code must be at least 2 characters" : null),
      course_name: (value) => (value.length < 3 ? "Course name must be at least 3 characters" : null),
      credit_hour: (value) => (value < 1 ? "Credit hours must be at least 1" : null),
      category: (value) => (value.length === 0 ? "Please select category" : null),
    },
  });

  // Clear errors and reset form when modal closes
  useEffect(() => {
    if (!opened) {
      dispatch(clearError());
      form.reset();
    }
  }, [opened, dispatch]);

  const handleAddCourse = async (values: typeof form.values) => {
    try {
      console.log('Form values:', values);
      
      await dispatch(addCourse({
        course_code: values.course_code.toUpperCase().trim(),
        course_name: values.course_name.trim(),
        credit_hour: values.credit_hour,
        category: values.category,
      })).unwrap();

      notifications.show({
        title: "Success!",
        message: "Course added successfully",
        color: "teal",
        icon: <IconCheck size={18} />,
      });
      
      form.reset();
      
      // Callback for parent component
      if (onCourseAdded) {
        onCourseAdded();
      }
    } catch (error) {
      console.error('Component error:', error);
      
      const errMsg =
        error instanceof Error
          ? error.message
          : typeof error === "string"
          ? error
          : "Unknown error occurred";

      notifications.show({
        title: "Error",
        message: errMsg,
        color: "red",
        icon: <IconX size={18} />,
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconBooks size={24} className="text-blue-600" />
          <Text fw={700} size="xl">Add New Course</Text>
        </Group>
      }
      size="lg"
      centered
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Stack gap="lg">
        {/* Header Section */}
        <Box className="text-center">
          <Text c="dimmed" size="sm">
            Add a new course to the system
          </Text>
        </Box>

        {/* Add Course Form */}
        <Card 
          shadow="sm" 
          padding="lg" 
          radius="lg" 
          withBorder 
          className="border-blue-100 bg-gradient-to-br from-blue-50/50 to-white"
        >
          <form onSubmit={form.onSubmit(handleAddCourse)}>
            <Stack gap="lg">
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <TextInput
                    label="Course Code"
                    placeholder="e.g., CS101, MATH201"
                    required
                    size="md"
                    {...form.getInputProps('course_code')}
                    classNames={{
                      input: "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 border-2 rounded-xl py-3 px-4 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={12}>
                  <TextInput
                    label="Course Name"
                    placeholder="e.g., Introduction to Computer Science"
                    required
                    size="md"
                    {...form.getInputProps('course_name')}
                    classNames={{
                      input: "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 border-2 rounded-xl py-3 px-4 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <NumberInput
                    label="Credit Hours"
                    placeholder="Enter credit hours"
                    min={1}
                    max={10}
                    required
                    size="md"
                    {...form.getInputProps('credit_hour')}
                    classNames={{
                      input: "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 border-2 rounded-xl py-3 px-4 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={6}>
                  <Select
                    label="Category"
                    placeholder="Select category"
                    data={category.map(cate => ({
                      value: cate,
                      label: cate,
                    }))}
                    required
                    size="md"
                    {...form.getInputProps('category')}
                    classNames={{
                      input: "focus:border-blue-500 focus:ring-2 focus:ring-blue-200 border-2 rounded-xl py-3 px-4 transition-all duration-200",
                    }}
                  />
                </Grid.Col>
              </Grid>

              {coursesError && (
                <Alert 
                  icon={<IconAlertCircle size={20} />} 
                  title="Error" 
                  color="red" 
                  variant="light"
                  className="rounded-xl border-2"
                >
                  <Text className="text-sm">{coursesError}</Text>
                </Alert>
              )}

              <Group justify="flex-end" mt="md" className="gap-3">
                <Button
                  variant="outline"
                  color="gray"
                  onClick={onClose}
                  disabled={submitting}
                  size="md"
                  className="rounded-xl px-5 border-2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={submitting}
                  leftSection={<PlusCircleIcon className="h-5 w-5" />}
                  size="md"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl px-6 shadow-lg transition-all duration-200"
                >
                  {submitting ? "Adding..." : "Add Course"}
                </Button>
              </Group>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Modal>
  );
};

export default AddCourseModal;