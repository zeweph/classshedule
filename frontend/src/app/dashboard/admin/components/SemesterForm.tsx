/* eslint-disable @typescript-eslint/no-explicit-any */


import React, { useEffect, useState, useCallback } from 'react';
import { 
  Modal, 
  TextInput, 
  Button, 
  Group, 
  Text, 
  Select,
  Alert
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';
import { Found } from '@/app/auth/auth';
import { IconInfoCircle } from '@tabler/icons-react';

const API_BASE_URL = 'http://localhost:5000/api';

// Semester options
const SEMESTER_OPTIONS = [
  { value: 'SEMESTER_1', label: 'Semester 1' },
  { value: 'SEMESTER_2', label: 'Semester 2' },
  { value: 'SEMESTER_3', label: 'Semester 3' },
  { value: 'SEMESTER_4', label: 'Semester 4' },
  { value: 'SEMESTER_5', label: 'Semester 5' },
  { value: 'SEMESTER_6', label: 'Semester 6' },
  { value: 'SEMESTER_7', label: 'Semester 7' },
  { value: 'SEMESTER_8', label: 'Semester 8' },
  { value: 'FALL', label: 'Fall Semester' },
  { value: 'SPRING', label: 'Spring Semester' },
  { value: 'SUMMER', label: 'Summer Semester' },
  { value: 'WINTER', label: 'Winter Semester' },
];

// Status options
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
];

// Academic year options
const ACADEMIC_YEAR_OPTIONS = [
  { value: '2020-2021', label: '2020-2021' },
  { value: '2021-2022', label: '2021-2022' },
  { value: '2022-2023', label: '2022-2023' },
  { value: '2023-2024', label: '2023-2024' },
  { value: '2024-2025', label: '2024-2025' },
  { value: '2025-2026', label: '2025-2026' },
  { value: '2026-2027', label: '2026-2027' },
  { value: '2027-2028', label: '2027-2028' },
  { value: '2028-2029', label: '2028-2029' },
  { value: '2029-2030', label: '2029-2030' },
];
interface User {
  department_id: number;
  department_name: string;
}

interface Department {
  department_id: number;
  department_name: string;
}

interface Batch {
  batch_id: number;
  batch_year: string;
}

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

interface SemesterFormProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  departments: Department[];
  batches: Batch[];
  semester: Semester | null;
}

export default function SemesterForm({ opened, onClose, onSuccess, departments, batches, semester }: SemesterFormProps) {
  const isEditing = !!semester;
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formKey, setFormKey] = useState(0); // ADDED: Key to force form reinitialization

  // Safe initialization with defaults
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeBatches = Array.isArray(batches) ? batches : [];

  // Get default values function
  const getDefaultValues = useCallback(() => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const defaultAcademicYear = `${currentYear}-${nextYear}`;
    
    const today = new Date();
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(today.getMonth() + 4);
    
    // Get default batch ID if available
    const defaultBatchId = safeBatches.length > 0 ? String(safeBatches[0].batch_id) : '';
    
    return {
      semester: semester?.semester || '',
      academic_year: semester?.academic_year || defaultAcademicYear,
      start_date: semester?.start_date || today.toISOString().split('T')[0],
      end_date: semester?.end_date || defaultEndDate.toISOString().split('T')[0],
      status: semester?.status || 'active',
      department_id: semester?.department_id ? String(semester.department_id) : (user?.department_id ? String(user.department_id) : ''),
      batch_id: semester?.batch_id ? String(semester.batch_id) : defaultBatchId,
    };
  }, [semester, user, safeBatches]);

  // Initialize form WITHOUT the invalid 'key' property
  const form = useForm({
    initialValues: getDefaultValues(),
    validate: {
      semester: (value) => !value ? 'Semester is required' : null,
      academic_year: (value) => {
        if (!value) return 'Academic year is required';
        if (!value.match(/^\d{4}-\d{4}$/)) return 'Academic year must be in format: YYYY-YYYY';
        return null;
      },
      start_date: (value) => !value ? 'Start date is required' : null,
      end_date: (value) => !value ? 'End date is required' : null,
      department_id: (value) => !value ? 'Department is required' : null,
      batch_id: (value) => !value ? 'Batch is required' : null,
    },
  });

  // Fetch user data - only once
  useEffect(() => {
    const checkAuth = async () => {
      const foundUser = await Found();
      setUser(foundUser);
    };
    checkAuth();
  }, []);

  // Reset form when modal opens or semester changes - FIXED APPROACH
  useEffect(() => {
    if (opened) {
      const values = getDefaultValues();
      form.setValues(values);
      
      // Force form reinitialization by changing the key when switching between edit/create
      setFormKey(prev => prev + 1);
    }
  }, [opened, semester?.id]); // Reset when opened or semester id changes

  const handleSubmit = async (values: typeof form.values) => {
    try {
      setLoading(true);

      // Validate dates
      const startDate = new Date(values.start_date);
      const endDate = new Date(values.end_date);
      
      if (startDate >= endDate) {
        notifications.show({
          title: 'Error',
          message: 'End date must be after start date',
          color: 'red',
        });
        return;
      }

      // Validate that we have a batch selected
      if (!values.batch_id) {
        notifications.show({
          title: 'Error',
          message: 'Please select a batch',
          color: 'red',
        });
        return;
      }

      const payload = {
        semester: values.semester,
        academic_year: values.academic_year,
        start_date: values.start_date,
        end_date: values.end_date,
        status: values.status,
        department_id: parseInt(values.department_id),
        batch_id: parseInt(values.batch_id),
      };

      if (isEditing && semester) {
        await axios.put(`${API_BASE_URL}/semesters/${semester.id}`, payload);
        notifications.show({
          title: 'Success',
          message: 'Semester updated successfully',
          color: 'green',
        });
      } else {
        await axios.post(`${API_BASE_URL}/semesters`, payload);
        notifications.show({
          title: 'Success',
          message: 'Semester created successfully',
          color: 'green',
        });
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to save semester';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  // Get selected batch info for display
  const getSelectedBatchInfo = () => {
    if (!form.values.batch_id) return null;
    const batch = safeBatches.find(b => String(b.batch_id) === form.values.batch_id);
    return batch ? batch.batch_year : 'Unknown Batch';
  };

  // Get selected department info for display
  const getSelectedDepartmentInfo = () => {
    if (!form.values.department_id) return null;
    const department = safeDepartments.find(d => String(d.department_id) === form.values.department_id);
    return department ? department.department_name : 'Unknown Department';
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={600}>
          {isEditing ? 'Edit Semester' : 'Create New Semester'}
        </Text>
      }
      size="lg"
      radius="md"
      key={formKey} // ADDED: Use key on Modal to force re-render
    >
      <form onSubmit={form.onSubmit(handleSubmit)} key={formKey}> {/* ADDED: key on form */}
        <div className="space-y-4">
          <Select
            label="Semester"
            placeholder="Select semester"
            data={SEMESTER_OPTIONS}
            required
            disabled={loading}
            {...form.getInputProps('semester')}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Academic Year"
              placeholder="Select academic year"
              data={ACADEMIC_YEAR_OPTIONS}
              required
              disabled={loading}
              {...form.getInputProps('academic_year')}
            />

            <Select
              label="Status"
              placeholder="Select status"
              data={STATUS_OPTIONS}
              required
              disabled={loading}
              {...form.getInputProps('status')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label="Start Date"
              type="date"
              required
              disabled={loading}
              {...form.getInputProps('start_date')}
            />

            <TextInput
              label="End Date"
              type="date"
              required
              disabled={loading}
              {...form.getInputProps('end_date')}
            />
          </div>

          <Select
            label="Department"
            placeholder="Select department"
            data={safeDepartments.map(dept => ({
              value: String(dept.department_id),
              label: dept.department_name
            }))}
            required
            disabled={loading || safeDepartments.length === 0}
            description={safeDepartments.length === 0 ? "No departments available" : `Available departments: ${safeDepartments.length}`}
            {...form.getInputProps('department_id')}
          />

          {/* Batch Selection with safe handling */}
          <Select
            label="Batch"
            placeholder={safeBatches.length === 0 ? "No batches available" : "Select batch"}
            data={safeBatches.map(batch => ({
              value: String(batch.batch_id),
              label: batch.batch_year
            }))}
            required
            disabled={loading || safeBatches.length === 0}
            description={
              safeBatches.length === 0 
                ? "No batches available. Please create batches first." 
                : `Available batches: ${safeBatches.length}`
            }
            {...form.getInputProps('batch_id')}
          />

          {/* Show warning if no batches available */}
          {safeBatches.length === 0 && (
            <Alert variant="light" color="orange" title="No Batches Available" icon={<IconInfoCircle />}>
              You need to create batches before you can create semesters. Please create batches first in the Batch Management section.
            </Alert>
          )}

          {/* Enhanced Summary Information */}
          {form.values.start_date && form.values.end_date && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <Text size="sm" fw={500} c="blue" className="mb-2">
                Semester Summary:
              </Text>
              <div className="space-y-1">
                <Text size="sm">
                  <strong>Duration:</strong> {new Date(form.values.start_date).toLocaleDateString()} to {new Date(form.values.end_date).toLocaleDateString()}
                </Text>
                {form.values.semester && (
                  <Text size="sm">
                    <strong>Semester:</strong> {SEMESTER_OPTIONS.find(s => s.value === form.values.semester)?.label}
                  </Text>
                )}
                {form.values.academic_year && (
                  <Text size="sm">
                    <strong>Academic Year:</strong> {form.values.academic_year}
                  </Text>
                )}
                {form.values.batch_id && (
                  <Text size="sm">
                    <strong>Batch:</strong> {getSelectedBatchInfo()}
                  </Text>
                )}
                {form.values.department_id && (
                  <Text size="sm">
                    <strong>Department:</strong> {getSelectedDepartmentInfo()}
                  </Text>
                )}
              </div>
            </div>
          )}
        </div>

        <Group justify="flex-end" className="mt-8 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700"
            loading={loading}
            disabled={safeBatches.length === 0}
          >
            {isEditing ? 'Update Semester' : 'Create Semester'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}