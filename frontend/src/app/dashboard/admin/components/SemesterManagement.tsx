/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Title,
  Card,
  Table,
  Button,
  Group,
  Text,
  LoadingOverlay,
  Badge,
  ActionIcon,
  Paper,
  Stack,
  ScrollArea,
  useMantineTheme,
  Box,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconRefresh, 
  IconCalendar,
} from '@tabler/icons-react';

import { 
  fetchSemesters, 
  deleteSemester, 
  selectSemesters, 
  selectSemestersLoading, 
  selectSemestersError,
  selectSemestersSuccessMessage,
  clearError,
  clearSuccessMessage
} from '../../../../store/slices/semesterSlice';
import { fetchDepartments, selectDepartments } from '../../../../store/slices/departmentsSlice';
import { fetchBatches, selectBatches } from '../../../../store/slices/batchSlice';
import SemesterForm from './SemesterForm';

interface Semester {
  id: number;
  semester: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  status: string;
  department_id: number;
  department_name: string;
  batch_id: number;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Batch {
  batch_id: number;
  batch_year: string;
}

const SEMESTER_DISPLAY: { [key: string]: string } = {
  'SEMESTER_1': 'Sem 1', 'SEMESTER_2': 'Sem 2', 'SEMESTER_3': 'Sem 3', 'SEMESTER_4': 'Sem 4',
  'SEMESTER_5': 'Sem 5', 'SEMESTER_6': 'Sem 6', 'SEMESTER_7': 'Sem 7', 'SEMESTER_8': 'Sem 8',
  'FALL': 'Fall', 'SPRING': 'Spring', 'SUMMER': 'Summer', 'WINTER': 'Winter',
};

export default function SemesterManagement() {
  const dispatch = useDispatch();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);

  const semesters = useSelector(selectSemesters);
  const departments = useSelector(selectDepartments);
  const batches = useSelector(selectBatches);
  const loading = useSelector(selectSemestersLoading);
  const error = useSelector(selectSemestersError);
  const successMessage = useSelector(selectSemestersSuccessMessage);

  const [formOpened, setFormOpened] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);

  // SAFE INITIALIZATION - FIXED: Define safeBatches here
  const safeSemesters: Semester[] = Array.isArray(semesters) ? semesters : [];
  const safeDepartments: Department[] = Array.isArray(departments) ? departments : [];
  const safeBatches: Batch[] = Array.isArray(batches) ? batches : []; // ADDED THIS LINE

  // Load data only once
  useEffect(() => {
    dispatch(fetchSemesters() as any);
    dispatch(fetchDepartments() as any);
    dispatch(fetchBatches() as any);
  }, [dispatch]);

  // Handle messages
  useEffect(() => {
    if (successMessage) {
      notifications.show({ title: 'Success', message: successMessage, color: 'green' });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      notifications.show({ title: 'Error', message: error, color: 'red' });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Callback functions
  const handleDelete = useCallback((semester: Semester) => {
    modals.openConfirmModal({
      title: 'Delete Semester',
      children: <Text size="sm">Delete {SEMESTER_DISPLAY[semester.semester]} ({semester.academic_year})?</Text>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        dispatch(deleteSemester(semester.id) as any);
      },
    });
  }, [dispatch]);

  const handleEdit = useCallback((semester: Semester) => {
    setEditingSemester(semester);
    setFormOpened(true);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpened(false);
    setEditingSemester(null);
  }, []);

  const handleFormSuccess = useCallback(() => {
    handleFormClose();
    dispatch(fetchSemesters() as any);
  }, [dispatch, handleFormClose]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchSemesters() as any);
    dispatch(fetchDepartments() as any);
    dispatch(fetchBatches() as any);
  }, [dispatch]);

  const handleAddNew = useCallback(() => {
    setEditingSemester(null);
    setFormOpened(true);
  }, []);

  // Utility functions
  const getStatusColor = (status: string) => {
    return status === 'active' ? 'green' : status === 'inactive' ? 'gray' : 'blue';
  };

  const getBatchYear = useCallback((batchId: number) => {
    const batch = safeBatches.find(b => b.batch_id === batchId);
    return batch ? batch.batch_year : 'Unknown';
  }, [safeBatches]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box className="w-full h-full p-4">
      <Stack gap="md" className="w-full h-full">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={1} className="text-2xl font-bold">Semester Management</Title>
            <Text c="dimmed">Manage academic semesters</Text>
          </div>
          <Group>
            <Button variant="outline" leftSection={<IconRefresh size={16} />} onClick={handleRefresh} loading={loading}>
              Refresh
            </Button>
            <Button 
              leftSection={<IconPlus size={16} />} 
              onClick={handleAddNew} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={safeBatches.length === 0} // Disable if no batches
            >
              Add Semester
            </Button>
          </Group>
        </Group>

        {/* Show warning if no batches available */}
        {safeBatches.length === 0 && (
          <Card withBorder className="bg-yellow-50 border-yellow-200">
            <Text c="orange" fw={500}>
              No batches available. Please create batches first in the Batch Management section.
            </Text>
          </Card>
        )}

        {/* Content */}
        <Card shadow="sm" padding="lg" radius="md" withBorder className="w-full flex-1">
          <LoadingOverlay visible={loading} />
          
          {safeSemesters.length === 0 && !loading ? (
            <Paper className="text-center py-12">
              <IconCalendar size={48} className="mx-auto text-gray-400 mb-4" />
              <Text c="dimmed" size="lg" className="mb-4">No semesters found</Text>
              <Button 
                onClick={handleAddNew} 
                leftSection={<IconPlus size={16} />}
                disabled={safeBatches.length === 0} // Disable if no batches
              >
                Create your first semester
              </Button>
              {safeBatches.length === 0 && (
                <Text c="red" size="sm" className="mt-2">
                  You need to create batches first
                </Text>
              )}
            </Paper>
          ) : (
            <ScrollArea className="w-full ">
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Semester</Table.Th>
                    <Table.Th>Academic Year</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Department</Table.Th>
                    <Table.Th>Batch</Table.Th>
                    <Table.Th>Start Date</Table.Th>
                    <Table.Th>End Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {safeSemesters.map((semester) => (
                    <Table.Tr key={semester.id} className="hover:bg-gray-50">
                      <Table.Td>
                        <Badge color="blue" variant="light">
                          {SEMESTER_DISPLAY[semester.semester] || semester.semester}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="indigo" variant="light">{semester.academic_year}</Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge color={getStatusColor(semester.status)} variant="light">
                          {semester.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{semester.department_name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge color="teal" variant="light">
                          {getBatchYear(semester.batch_id)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(semester.start_date)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(semester.end_date)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" color="blue" onClick={() => handleEdit(semester)}>
                            <IconEdit size={16} />
                          </ActionIcon>
                          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(semester)}>
                            <IconTrash size={16} />
                          </ActionIcon>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          )}
        </Card>
      </Stack>

      {/* SemesterForm with batches prop */}
      <SemesterForm
        opened={formOpened}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        departments={safeDepartments}
        batches={safeBatches} // PASS safeBatches here
        semester={editingSemester}
      />
    </Box>
  );
}