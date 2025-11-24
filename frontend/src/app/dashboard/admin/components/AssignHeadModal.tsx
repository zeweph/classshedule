/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  Group,
  Table,
  Modal,
  Select,
  Loader,
  Title,
  Container,
  ScrollArea,
  Alert,
  Box,
  Stack,
} from "@mantine/core";
import { UserPlusIcon } from "@heroicons/react/24/outline";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { Authentication, Found } from "@/app/auth/auth";
import {
  fetchDepartments,
  fetchInstructors,
  assignDepartmentHead,
  clearError,
  clearSuccessMessage,
  Department,
} from "@/store/slices/departmentsSlice";

interface AssignHeadModalProps {
  opened: boolean;
  onClose: () => void;
  department: Department | null;
  onAssign: (departmentId: number, instructorId: number) => void;
}

const AssignHeadModal: React.FC<AssignHeadModalProps> = ({
  opened,
  onClose,
  department,
  onAssign,
}) => {
  const dispatch = useAppDispatch();
  const { instructors } = useAppSelector((state) => state.departments);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      dispatch(fetchInstructors());
      setSelected(null);
    }
  }, [dispatch, opened]);

  const handleAssign = () => {
    if (department && selected) {
      onAssign(department.department_id, Number(selected));
      onClose();
    }
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={handleClose} 
      title={`Assign Head - ${department?.department_name || "Department"}`} 
      centered
      size="md"
    >
      <Select
        label="Select Instructor"
        placeholder="Choose instructor"
        data={instructors.map((inst) => ({
          value: inst.id.toString(),
          label: `${inst.full_name} ${inst.department_name ? `(${inst.department_name})` : ""}`.trim(),
        }))}
        value={selected}
        onChange={setSelected}
        searchable
        clearable
        nothingFoundMessage="No instructors found"
      />
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={handleClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleAssign}
          disabled={!selected}
        >
          Assign Head
        </Button>
      </Group>
    </Modal>
  );
};

const AssignHead: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    departments, 
    loading, 
    error, 
    successMessage 
  } = useAppSelector((state) => state.departments);
  
  const [assignModal, setAssignModal] = useState<Department | null>(null);

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

  // Assign Head
  const handleAssignHead = async (departmentId: number, instructorId: number) => {
    dispatch(assignDepartmentHead({ departmentId, instructorId }));
    setAssignModal(null);
  };

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Box>
          <Title order={1} mb="xs">Assign Department Heads</Title>
          <Title order={2} size="h4" c="dimmed">
            Assign instructors as department heads
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
                    <Table.Th>Current Head</Table.Th>
                    <Table.Th style={{ textAlign: 'center' }}>Action</Table.Th>
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
                          <Button
                            size="xs"
                            color="indigo"
                            onClick={() => setAssignModal(dept)}
                            leftSection={<UserPlusIcon className="h-4 w-4" />}
                          >
                            Assign Head
                          </Button>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  )}
                </Table.Tbody>
              </Table>
            )}
          </ScrollArea>
        </Card>

        {/* Assign Head Modal */}
        <AssignHeadModal
          opened={!!assignModal}
          onClose={() => setAssignModal(null)}
          department={assignModal}
          onAssign={handleAssignHead}
        />
      </Stack>
    </Container>
  );
};

export default AssignHead;