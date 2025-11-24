/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Modal, TextInput, Button, Group, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export default function BatchForm({ opened, onClose, onSuccess, batch }) {
  const isEditing = !!batch;
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      batch_year: '',
    },
    validate: {
      batch_year: (value) => {
        if (!value) return 'Batch year is required';
        if (value.length > 20) return 'Batch year must be less than 20 characters';
        return null;
      },
    },
  });

  useEffect(() => {
    if (batch) {
      form.setValues({
        batch_year: batch.batch_year,
      });
    } 
  }, [batch, opened]);

  const handleSubmit = async (values: { batch_year: any; }) => {
    try {
      setLoading(true);

      const payload = {
        batch_year: values.batch_year,
      };

      if (isEditing) {
        await axios.put(`${API_BASE_URL}/batches/${batch.batch_id}`, payload);
        notifications.show({
          title: 'Success',
          message: 'Batch updated successfully',
          color: 'green',
        });
      } else {
        await axios.post(`${API_BASE_URL}/batches`, payload);
        notifications.show({
          title: 'Success',
          message: 'Batch created successfully',
          color: 'green',
        });
      }

      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to save batch';
      notifications.show({
        title: 'Error',
        message: errorMessage,
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={600}>
          {isEditing ? 'Edit Batch' : 'Create New Batch'}
        </Text>
      }
      size="md"
      radius="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <div className="space-y-4">
          <TextInput
            label="Batch Year/Name"
            placeholder="Enter batch year or name (e.g., First Year, Second Year etc.)"
            required
            disabled={loading}
            {...form.getInputProps('batch_year')}
            description="Enter batch identifier (max 20 characters)"
          />
          
          {form.values.batch_year && (
            <Text size="sm" c="blue">
              Batch: {form.values.batch_year}
            </Text>
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
          >
            {isEditing ? 'Update Batch' : 'Create Batch'}
          </Button>
        </Group>
      </form>
    </Modal>
  );
}