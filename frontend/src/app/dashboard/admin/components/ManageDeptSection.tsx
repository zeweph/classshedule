/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  PencilSquareIcon,
  TrashIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  Card,
  Group,
  Table,
  TextInput,
  Modal,
  Loader,
  Title,
  Container,
  ScrollArea,
  Alert,
  Box,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Authentication, Found } from "@/app/auth/auth";
import {
  fetchDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  clearError,
  clearSuccessMessage,
  Department,
} from "@/store/slices/departmentsSlice";

interface DepartmentModalProps {
  opened: boolean;
  onClose: () => void;
  department: Department | null;
  onSave: (id: number | null, name: string) => void;
}

const DepartmentModal: React.FC<DepartmentModalProps> = ({
  opened,
  onClose,
  department,
  onSave,
}) => {
  const [departmentName, setDepartmentName] = useState("");

  useEffect(() => {
    if (department) {
      setDepartmentName(department.department_name);
    } else {
      setDepartmentName("");
    }
  }, [department, opened]);

  const handleSave = () => {
    if (!departmentName.trim()) {
      notifications.show({
        color: "red",
        title: "Error",
        message: "Department name is required",
      });
      return;
    }
    
    onSave(department ? department.department_id : null, departmentName.trim());
    onClose();
  };

  const handleClose = () => {
    setDepartmentName("");
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={department ? "Edit Department" : "Add New Department"}
      centered
    >
      <TextInput
        label="Department Name"
        placeholder="Enter department name"
        value={departmentName}
        onChange={(e) => setDepartmentName(e.currentTarget.value)}
        required
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {department ? "Update" : "Add"} Department
        </Button>
      </Group>
    </Modal>
  );
};

const ManageDepartments: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    departments, 
    loading, 
    error, 
    successMessage 
  } = useAppSelector((state) => state.departments);
  
  const [departmentModal, setDepartmentModal] = useState<{
    opened: boolean;
    department: Department | null;
  }>({
    opened: false,
    department: null
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDepartments());
  }, [dispatch]);

  // Clear messages after a delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);
  
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

  // Add department
  const handleAddDepartment = () => {
    setDepartmentModal({
      opened: true,
      department: null
    });
  };

  // Edit department
  const handleEditDepartment = (department: Department) => {
    setDepartmentModal({
      opened: true,
      department
    });
  };

  // Save department (add or edit)
  const handleSaveDepartment = async (id: number | null, name: string) => {
    if (id === null) {
      // Add new department
      dispatch(addDepartment(name));
    } else {
      // Update existing department
      dispatch(updateDepartment({ id, departmentName: name }));
    }
  };

  // Delete department
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this department?")) {
      return;
    }
    dispatch(deleteDepartment(id));
  };

  const handleCloseModal = () => {
    setDepartmentModal({
      opened: false,
      department: null
    });
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Box>
          <Title order={1} mb="xs">Manage Departments</Title>
          <Title order={2} size="h4" c="dimmed">
            Create and manage academic departments
          </Title>
        </Box>

        {/* Error and Success Messages */}
        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {successMessage && (
          <Alert color="green" title="Success">
            {successMessage}
          </Alert>
        )}

        <Card shadow="sm" radius="lg" p="lg">
          {/* Add Button */}
          <Group justify="flex-end" mb="md">
            <Button 
              onClick={handleAddDepartment}
              leftSection={<PlusCircleIcon className="h-5 w-5" />}
            >
              Add Department
            </Button>
          </Group>

          {/* Departments Table */}
          <ScrollArea>
            {loading ? (
              <Box py="xl" style={{ display: 'flex', justifyContent: 'center' }}>
                <Loader color="blue" />
              </Box>
            ) : (
              <Table highlightOnHover verticalSpacing="sm" striped withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Department Name</Table.Th>
                    <Table.Th>Head</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {departments.length === 0 ? (
                    <Table.Tr>
                      <Table.Td colSpan={3} style={{ textAlign: 'center' }} py="xl">
                        No departments found
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    departments.map((dept) => (
                      <Table.Tr key={dept.department_id}>
                        <Table.Td>
                          {dept.department_name}
                        </Table.Td>
                        <Table.Td>
                          {dept.head_name || "Not Assigned"}
                        </Table.Td>
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Group justify="center" gap="xs">
                            <Button
                              size="xs"
                              onClick={() => handleEditDepartment(dept)}
                              leftSection={<PencilSquareIcon className="h-4 w-4" />}
                            >
                              Edit
                            </Button>
                            <Button
                              size="xs"
                              color="red"
                              onClick={() => handleDelete(dept.department_id)}
                              leftSection={<TrashIcon className="h-4 w-4" />}
                            >
                              Delete
                            </Button>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            )}
          </ScrollArea>
        </Card>

        {/* Department Modal */}
        <DepartmentModal
          opened={departmentModal.opened}
          onClose={handleCloseModal}
          department={departmentModal.department}
          onSave={handleSaveDepartment}
        />
      </Stack>
    </Container>
  );
};

export default ManageDepartments;