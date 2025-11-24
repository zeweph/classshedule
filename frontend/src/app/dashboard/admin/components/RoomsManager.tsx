/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Select,
  NumberInput,
  MultiSelect,
  Loader,
  Alert,
  Badge,
  Stack,
  Grid,
} from "@mantine/core";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  HomeModernIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useForm } from "@mantine/form";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  fetchRooms,
  fetchFloors,
  fetchBlocks,
  addRoom,
  updateRoom,
  deleteRoom,
  clearError,
  clearSuccessMessage,
  Room, // Import Room interface from Redux slice
  RoomFormData, // Import RoomFormData from Redux slice
} from "@/store/slices/roomsSlice";

// Remove the local Room interface and use the imported one from Redux slice

const RoomsManager: React.FC = () => {
  const dispatch = useAppDispatch();
  const { rooms, floors, blocks, loading, error, successMessage } = useAppSelector((state) => state.rooms);
  
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filteredFloors, setFilteredFloors] = useState<any[]>([]);

  // Debug logs
  useEffect(() => {
    console.log("=== ROOMS MANAGER DEBUG ===");
    console.log("Rooms:", rooms);
    console.log("Rooms length:", rooms.length);
    console.log("Loading:", loading);
    console.log("Error:", error);
    console.log("Floors:", floors);
    console.log("Floors length:", floors.length);
    console.log("Blocks:", blocks);
    console.log("Blocks length:", blocks.length);
    console.log("========================");
  }, [rooms, loading, error, floors, blocks]);

  const form = useForm({
    initialValues: {
      floor_id: "",
      room_number: "",
      room_name: "",
      room_type: "classroom",
      capacity: 30,
      facilities: [] as string[],
      is_available: true,
    },
    validate: {
      floor_id: (value) => (value ? null : "Floor is required"),
      room_number: (value) => (value.trim().length < 1 ? "Room number is required" : null),
      room_type: (value) => (value ? null : "Room type is required"),
    },
  });

  // Room type options
  const roomTypeOptions = [
    { value: "classroom", label: "Classroom" },
    { value: "lab", label: "Laboratory" },
    { value: "office", label: "Office" },
    { value: "conference", label: "Conference Room" },
    { value: "library", label: "Library" },
    { value: "auditorium", label: "Auditorium" },
    { value: "other", label: "Other" },
  ];

  // Facilities options
  const facilitiesOptions = [
    { value: "projector", label: "Projector" },
    { value: "ac", label: "Air Conditioning" },
    { value: "computers", label: "Computers" },
    { value: "whiteboard", label: "Whiteboard" },
    { value: "sound_system", label: "Sound System" },
    { value: "lab_equipment", label: "Lab Equipment" },
    { value: "fume_hood", label: "Fume Hood" },
    { value: "wifi", label: "WiFi" },
  ];

  // Fetch data on component mount
  useEffect(() => {
    console.log("Dispatching fetch actions...");
    dispatch(fetchRooms());
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

  // Update filtered floors when floors change
  useEffect(() => {
    setFilteredFloors(floors);
  }, [floors]);

  // Handle form submission
  const handleSubmit = async (values: typeof form.values) => {
    setActionLoading(true);
    try {
      // Create proper payload matching RoomFormData interface
      const payload: RoomFormData = {
        floor_id: parseInt(values.floor_id),
        room_number: values.room_number.trim(),
        room_name: values.room_name?.trim() || undefined,
        room_type: values.room_type,
        capacity: values.capacity && values.capacity > 0 ? values.capacity : undefined,
        facilities: values.facilities || [],
        is_available: values.is_available,
      };

      console.log('Submitting room data:', payload);

      if (editingRoom) {
        await dispatch(updateRoom({
          roomId: editingRoom.room_id,
          roomData: payload
        })).unwrap();
      } else {
        await dispatch(addRoom(payload)).unwrap();
      }
      
      setModalOpened(false);
      form.reset();
      setEditingRoom(null);
      // Refresh rooms after successful operation
      dispatch(fetchRooms());
    } catch (err) {
      console.error('Error in handleSubmit:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (room: Room) => {
    console.log('Editing room:', room);
    setEditingRoom(room);
    form.setValues({
      floor_id: room.floor_id.toString(),
      room_number: room.room_number,
      room_name: room.room_name || "",
      room_type: room.room_type,
      capacity: room.capacity || 30,
      facilities: room.facilities || [],
      is_available: room.is_available,
    });
    setModalOpened(true);
  };

  // Handle delete
  const handleDelete = async (roomId: number) => {
    if (!confirm("Are you sure you want to delete this room?")) {
      return;
    }

    setActionLoading(true);
    try {
      console.log('Deleting room with ID:', roomId);
      await dispatch(deleteRoom(roomId)).unwrap();
      // Refresh the rooms list after deletion
      dispatch(fetchRooms());
    } catch (err) {
      console.error('Error in handleDelete:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpened(false);
    setEditingRoom(null);
    form.reset();
  };

  const floorOptions = filteredFloors.map(floor => ({
    value: floor.floor_id.toString(),
    label: `${floor.block_name} - Floor ${floor.floor_number}${floor.floor_name ? ` (${floor.floor_name})` : ''}`
  }));

  const getRoomTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      classroom: "blue",
      lab: "green",
      office: "orange",
      conference: "purple",
      library: "cyan",
      auditorium: "red",
      other: "gray",
    };
    return colors[type] || "gray";
  };

  // Format room type for display
  const formatRoomType = (type: string) => {
    const typeMap: { [key: string]: string } = {
      classroom: "Classroom",
      lab: "Laboratory",
      office: "Office",
      conference: "Conference Room",
      library: "Library",
      auditorium: "Auditorium",
      other: "Other",
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Group justify="space-between">
        <div>
          <Title order={2} className="text-gray-900">
            Rooms Management
          </Title>
          <Text c="dimmed">Manage rooms across all floors and blocks</Text>
        </div>
        <Button
          leftSection={<PlusIcon className="h-5 w-5" />}
          onClick={() => setModalOpened(true)}
          disabled={floors.length === 0}
          loading={loading}
        >
          Add Room
        </Button>
      </Group>

      {/* Debug Info - Temporary */}
      <Card withBorder className="bg-yellow-50">
        <Title order={4} className="text-yellow-800">Debug Information</Title>
        <Text size="sm" className="text-yellow-700">
          Rooms: {rooms.length} | Floors: {floors.length} | Blocks: {blocks.length} 
        </Text>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert color="red" title="Error" withCloseButton onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {successMessage && (
        <Alert color="green" title="Success" withCloseButton onClose={() => dispatch(clearSuccessMessage())}>
          {successMessage}
        </Alert>
      )}

      {/* No Floors Warning */}
      {floors.length === 0 && (
        <Alert color="yellow" title="No Floors Found">
          You need to create floors first before adding rooms.
        </Alert>
      )}

      {/* Rooms Table */}
      <Card withBorder radius="md">
        {loading && rooms.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" />
            <Text ml="md">Loading rooms...</Text>
          </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-12">
            <HomeModernIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <Text c="dimmed" size="lg" mb="md">
              No rooms found
            </Text>
            <Text c="dimmed" size="sm" mb="md">
              {floors.length === 0 
                ? "Create floors first to add rooms" 
                : "Click the button below to add your first room"}
            </Text>
            <Button
              leftSection={<PlusIcon className="h-5 w-5" />}
              onClick={() => setModalOpened(true)}
              disabled={floors.length === 0}
              loading={loading}
            >
              Add Your First Room
            </Button>
          </div>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Room Number</Table.Th>
                  <Table.Th>Room Name</Table.Th>
                  <Table.Th>Location</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Capacity</Table.Th>
                  <Table.Th>Facilities</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rooms.map((room) => (
                  <Table.Tr key={room.room_id}>
                    <Table.Td>
                      <Text fw={500}>{room.room_number}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text>{room.room_name || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm">
                        {room.block_name} - Floor {room.floor_number}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color={getRoomTypeColor(room.room_type)}>
                        {formatRoomType(room.room_type)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text>{room.capacity || "—"}</Text>
                    </Table.Td>
                    <Table.Td>
                      {room.facilities && room.facilities.length > 0 ? (
                        <Text size="sm" lineClamp={1} title={room.facilities.join(", ")}>
                          {room.facilities.join(", ")}
                        </Text>
                      ) : (
                        <Text c="dimmed" size="sm">None</Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={room.is_available ? "green" : "red"}
                        variant="light"
                        leftSection={
                          room.is_available ? (
                            <CheckIcon className="h-3 w-3" />
                          ) : (
                            <XMarkIcon className="h-3 w-3" />
                          )
                        }
                      >
                        {room.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon
                          color="blue"
                          variant="light"
                          onClick={() => handleEdit(room)}
                          disabled={actionLoading}
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="light"
                          onClick={() => handleDelete(room.room_id)}
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
        title={editingRoom ? `Edit Room - ${editingRoom.room_number}` : "Add New Room"}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <Select
              label="Floor"
              placeholder="Select a floor"
              data={floorOptions}
              required
              searchable
              nothingFoundMessage="No floors found"
              {...form.getInputProps("floor_id")}
            />
            
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  label="Room Number"
                  placeholder="e.g., 101, A12"
                  required
                  {...form.getInputProps("room_number")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <Select
                  label="Room Type"
                  data={roomTypeOptions}
                  required
                  {...form.getInputProps("room_type")}
                />
              </Grid.Col>
            </Grid>

            <TextInput
              label="Room Name"
              placeholder="e.g., Chemistry Lab, Main Hall"
              {...form.getInputProps("room_name")}
            />

            <NumberInput
              label="Capacity"
              placeholder="Number of people"
              min={1}
              {...form.getInputProps("capacity")}
            />

            <MultiSelect
              label="Facilities"
              placeholder="Select facilities"
              data={facilitiesOptions}
              clearable
              searchable
              nothingFoundMessage="Nothing found"
              {...form.getInputProps("facilities")}
            />

            <Select
              label="Availability"
              data={[
                { value: "true", label: "Available" },
                { value: "false", label: "Unavailable" },
              ]}
              value={form.values.is_available.toString()}
              onChange={(value) => form.setFieldValue("is_available", value === "true")}
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
                {editingRoom ? "Update Room" : "Add Room"}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </div>
  );
};

export default RoomsManager;