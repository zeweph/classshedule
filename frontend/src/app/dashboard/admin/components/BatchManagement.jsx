import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
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
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';

import { 
  fetchBatches, 
  deleteBatch, 
  selectBatches, 
  selectBatchesLoading, 
  selectBatchesError,
  selectBatchesSuccessMessage,
  selectCurrentBatch,
  clearError,
  clearSuccessMessage
} from '../../../../store/slices/batchSlice';
import BatchForm from './batchForm';

export default function BatchManagement() {
  const dispatch = useDispatch();
  const batches = useSelector(selectBatches);
  const loading = useSelector(selectBatchesLoading);
  const error = useSelector(selectBatchesError);
  const successMessage = useSelector(selectBatchesSuccessMessage);
  const currentBatch = useSelector(selectCurrentBatch);

  const [formOpened, setFormOpened] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);

  useEffect(() => {
    dispatch(fetchBatches());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      notifications.show({
        title: 'Success',
        message: successMessage,
        color: 'green',
      });
      dispatch(clearSuccessMessage());
    }
  }, [successMessage, dispatch]);

  useEffect(() => {
    if (error) {
      notifications.show({
        title: 'Error',
        message: error,
        color: 'red',
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleDelete = (batch) => {
    modals.openConfirmModal({
      title: 'Delete Batch',
      children: (
        <Text size="sm">
          Are you sure you want to delete batch "{batch.batch_year}"? 
          This action cannot be undone.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await dispatch(deleteBatch(batch.batch_id)).unwrap();
        } catch (error) {
          // Error is handled by the useEffect above
        }
      },
    });
  };

  const handleEdit = (batch) => {
    setEditingBatch(batch);
    setFormOpened(true);
  };

  const handleFormClose = () => {
    setFormOpened(false);
    setEditingBatch(null);
  };

  const handleFormSuccess = () => {
    handleFormClose();
  };

  const handleRefresh = () => {
    dispatch(fetchBatches());
  };

  const getBatchBadgeColor = (batchYear) => {
    const year = batchYear.toLowerCase();
    if (year.includes('first') || year.includes('1')) return 'blue';
    if (year.includes('second') || year.includes('2')) return 'teal';
    if (year.includes('third') || year.includes('3')) return 'green';
    if (year.includes('fourth') || year.includes('4')) return 'orange';
    if (year.includes('fifth') || year.includes('5')) return 'red';
    if (year.includes('sixth') || year.includes('6')) return 'purple';
    if (year.match(/\d{4}/)) return 'indigo'; // For years like 2024, 2025
    return 'gray';
  };

  const rows = batches.map((batch) => (
    <Table.Tr key={batch.batch_id} className="hover:bg-gray-50">
      <Table.Td className="font-semibold">#{batch.batch_id}</Table.Td>
      <Table.Td>
        <Badge color={getBatchBadgeColor(batch.batch_year)} variant="light" size="lg">
          {batch.batch_year}
        </Badge>
      </Table.Td>
      <Table.Td className="text-sm text-gray-600">
        {new Date(batch.created_at).toLocaleDateString()}
      </Table.Td>
      <Table.Td className="text-sm text-gray-600">
        {new Date(batch.updated_at).toLocaleDateString()}
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon
            variant="subtle"
            color="blue"
            onClick={() => handleEdit(batch)}
            className="hover:bg-blue-50"
          >
            <IconEdit size={16} />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            onClick={() => handleDelete(batch)}
            className="hover:bg-red-50"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="xl" className="py-8">
      <div className="mb-8">
        <Group justify="space-between" className="mb-6">
          <div>
            <Title order={1} className="text-3xl font-bold text-gray-900">
              Batch Management
            </Title>
            <Text c="dimmed" className="mt-2">
              Manage academic batches with flexible year/name identifiers
            </Text>
            {currentBatch && (
              <Text size="sm" className="mt-1 text-green-600">
                Currently viewing: {currentBatch.batch_year}
              </Text>
            )}
          </div>
          <Group>
            <Button
              variant="outline"
              leftSection={<IconRefresh size={16} />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setFormOpened(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Batch
            </Button>
          </Group>
        </Group>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <LoadingOverlay visible={loading} />
          
          {batches.length === 0 && !loading ? (
            <Paper className="text-center py-12">
              <Text c="dimmed" size="lg" className="mb-4">
                No batches found
              </Text>
              <Text size="sm" c="dimmed" className="mb-4">
                Create batches with year numbers (2024), academic years (2023-2024), or names (First Year)
              </Text>
              <Button
                onClick={() => setFormOpened(true)}
                leftSection={<IconPlus size={16} />}
              >
                Create your first batch
              </Button>
            </Paper>
          ) : (
            <Table.ScrollContainer minWidth={600}>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Batch ID</Table.Th>
                    <Table.Th>Batch Year/Name</Table.Th>
                    <Table.Th>Created Date</Table.Th>
                    <Table.Th>Updated Date</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          )}
        </Card>
      </div>

      <BatchForm
        opened={formOpened}
        onClose={handleFormClose}
        onSuccess={handleFormSuccess}
        batch={editingBatch}
      />
    </Container>
  );
}