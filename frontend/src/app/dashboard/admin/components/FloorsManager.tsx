"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Title,
  Text,
  Table,
  Button,
  Group,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Loader,
  Alert,
  Badge,
  Stack,
} from "@mantine/core";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchFloors,
  fetchBlocks,
  addFloor,
  updateFloor,
  deleteFloor,
  clearError,
  clearSuccessMessage,
} from "@/store/slices/roomsSlice";

interface Floor {
  floor_id: number;
  block_id: number;
  floor_number: number;
  floor_name?: string;
  description?: string;
  block_name: string;
  block_code: string;
}

// Then adapt your form values to handle string inputs
interface FloorFormValues {
  block_id: string;
  floor_number: string;
  floor_name: string;
  description: string;
}

// Type for API payload
interface FloorPayload {
  block_id: number;
  floor_number: number;
  floor_name?: string;
  description?: string;
}

const FloorsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { floors, blocks, loading, error, successMessage } = useAppSelector((state) => state.rooms);
  
  const [modalOpened, setModalOpened] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const form = useForm<FloorFormValues>({
    initialValues: {
      block_id: "",
      floor_number: "",
      floor_name: "",
      description: "",
    },
    validate: {
      block_id: (value) => (value ? null : "Block is required"),
      floor_number: (value) => (value ? null : "Floor number is required"),
    },
  });

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchFloors());
    dispatch(fetchBlocks());
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

  // Handle form submission
  const handleSubmit = async (values: FloorFormValues) => {
    setActionLoading(true);
    try {
      const payload: FloorPayload = {
        block_id: parseInt(values.block_id),
        floor_number: parseInt(values.floor_number),
        floor_name: values.floor_name || undefined,
        description: values.description || undefined,
      };

      if (editingFloor) {
        await dispatch(updateFloor({
          floorId: editingFloor.floor_id,
          floorData: payload
        })).unwrap();
      } else {
        await dispatch(addFloor(payload)).unwrap(); 
      }
      
      setModalOpened(false);
      form.reset();
      setEditingFloor(null);
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (floor: Floor) => {
    console.log('Editing floor:', floor);
    setEditingFloor(floor);
    form.setValues({
      block_id: floor.block_id.toString(),
      floor_number: floor.floor_number.toString(),
      floor_name: floor.floor_name || "",
      description: floor.description || "",
    });
    setModalOpened(true);
  };

  // Handle delete
  const handleDelete = async (floorId: number) => {
    if (!confirm("Are you sure you want to delete this floor? This will also delete all associated rooms.")) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Deleting floor with ID:', floorId);
      await dispatch(deleteFloor(floorId)).unwrap();
      // Refresh the floors list after deletion
      dispatch(fetchFloors());
    } catch (err) {
      console.error('Error in handleDelete:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingFloor(null);
    form.reset();
  };

  const blockOptions = blocks.map(block => ({
    value: block.block_id.toString(),
    label: `${block.block_name} (${block.block_code})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} className="text-gray-900">
            Floors Management
          </Title>
          <Text c="dimmed">Manage floors within building blocks</Text>
        </div>
        <Button
          leftSection={<PlusIcon className="h-5 w-5" />}
          onClick={() => setModalOpened(true)}
          disabled={blocks.length === 0}
          loading={loading}
        >
          Add Floor
        </Button>
      </Group>

      {/* Error Alert */}
      {error && (
        <Alert color="red" title="Error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert color="green" title="Success" onClose={() => dispatch(clearSuccessMessage())}>
          {successMessage}
        </Alert>
      )}

      {/* No Blocks Warning */}
      {blocks.length === 0 && (
        <Alert color="yellow" title="No Blocks Found">
          You need to create blocks first before adding floors.
        </Alert>
      )}

      {/* Floors Table */}
      <Card withBorder radius="md">
        {loading && floors.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" />
            <Text ml="md">Loading floors...</Text>
          </div>
        ) : floors.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <Text c="dimmed" size="lg" mb="md">
              No floors found
            </Text>
            <Button
              leftSection={<PlusIcon className="h-5 w-5" />}
              onClick={() => setModalOpened(true)}
              disabled={blocks.length === 0}
              loading={loading}
            >
              Add Your First Floor
            </Button>
          </div>
        ) : (
          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Block</Table.Th>
                  <Table.Th>Floor Number</Table.Th>
                  <Table.Th>Floor Name</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {floors.map((floor) => (
                  <Table.Tr key={floor.floor_id}>
                    <Table.Td>
                      <Badge variant="light" color="blue">
                        {floor.block_name} ({floor.block_code})
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text fw={500}>Floor {floor.floor_number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{floor.floor_name || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text c="dimmed" size="sm">
                        {floor.description || "No description"}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => handleEdit(floor)}
                          disabled={actionLoading}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(floor.floor_id)}
                          disabled={actionLoading}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        opened={modalOpened}
        onClose={handleCloseModal}
        title={editingFloor ? `Edit Floor - Floor ${editingFloor.floor_number}` : "Add New Floor"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Block"
              placeholder="Select a block"
              data={blockOptions}
              required
              {...form.getInputProps("block_id")}
            />
            <TextInput
              label="Floor Number"
              placeholder="e.g., 1, 2, 3"
              type="number"
              required
              {...form.getInputProps("floor_number")}
            />
            <TextInput
              label="Floor Name"
              placeholder="e.g., Ground Floor, First Floor"
              {...form.getInputProps("floor_name")}
            />
            <Textarea
              label="Description"
              placeholder="Optional description of the floor"
              rows={3}
              {...form.getInputProps("description")}
            />
            
            <Group justify="flex-end" mt="md">
              <Button 
                variant="outline" 
                onClick={handleCloseModal}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                loading={actionLoading}
              >
                {editingFloor ? "Update Floor" : "Add Floor"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default FloorsManager;