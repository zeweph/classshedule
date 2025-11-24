// store/slices/roomSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export interface Block {
  block_id: number;
  block_name: string;
  block_code: string;
  description?: string;
}

export interface Floor {
  floor_id: number;
  block_id: number;
  floor_number: number;
  floor_name?: string;
  description?: string;
  block_name: string;
  block_code: string;
}

// Add this interface for creating/updating floors (without the auto-generated and joined fields)
export interface FloorFormData {
  block_id: number;
  floor_number: number;
  floor_name?: string;
  description?: string;
}

export interface Room {
  room_id: number;
  floor_id: number;
  room_number: string;
  room_name?: string;
  room_type: string;
  capacity?: number;
  facilities: string[];
  is_available: boolean;
  floor_number?: number;
  block_name?: string;
  block_id?: number;
}

// Interface for creating/updating rooms (without auto-generated and joined fields)
export interface RoomFormData {
  floor_id: number;
  room_number: string;
  room_name?: string;
  room_type: string;
  capacity?: number;
  facilities: string[];
  is_available: boolean;
}

interface RoomState {
  blocks: Block[];
  floors: Floor[];
  rooms: Room[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: RoomState = {
  blocks: [],
  floors: [],
  rooms: [],
  loading: false,
  error: null,
  successMessage: null,
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Async Thunks
export const fetchBlocks = createAsyncThunk(
  'rooms/fetchBlocks',
  async () => {
    const response = await fetch(`${API_URL}/api/blocks`);
    if (!response.ok) throw new Error('Failed to fetch blocks');
    return response.json();
  }
);

export const fetchFloors = createAsyncThunk(
  'rooms/fetchFloors',
  async (blockId?: number) => {
    console.log('Fetching floors with blockId:', blockId);
    
    let url = `${API_URL}/api/floors`;
    if (blockId) {
      url += `?block_id=${blockId}`;
    }
    
    console.log('Fetching from URL:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch floors. Status:', response.status, 'Response:', errorText);
      throw new Error(`Failed to fetch floors: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Fetched floors data:', data);
    return data;
  }
);

export const fetchRooms = createAsyncThunk(
  'rooms/fetchRooms',
  async (filters?: { blockId?: number; floorId?: number }) => {
    const params = new URLSearchParams();
    if (filters?.blockId) params.append('block_id', filters.blockId.toString());
    if (filters?.floorId) params.append('floor_id', filters.floorId.toString());
    
    const url = `${API_URL}/api/rooms?${params.toString()}`;
    console.log('Fetching rooms from URL:', url);
    
    const response = await fetch(url);
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch rooms. Status:', response.status, 'Response:', errorText);
      throw new Error(`Failed to fetch rooms: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Rooms data received:', data);
    return data;
  }
);

export const addBlock = createAsyncThunk(
  'rooms/addBlock',
  async (blockData: Omit<Block, 'block_id'>) => {
    const response = await fetch(`${API_URL}/api/blocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });
    if (!response.ok) throw new Error('Failed to add block');
    return response.json();
  }
);

export const updateBlock = createAsyncThunk(
  'rooms/updateBlock',
  async ({ blockId, blockData }: { blockId: number; blockData: Partial<Block> }) => {
    console.log('Updating block with ID:', blockId);
    
    if (!blockId || isNaN(blockId)) {
      throw new Error('Invalid block ID');
    }

    const response = await fetch(`${API_URL}/api/blocks/${blockId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(blockData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update block');
    }
    
    return response.json();
  }
);

export const deleteBlock = createAsyncThunk(
  'rooms/deleteBlock',
  async (blockId: number) => {
    console.log('Deleting block with ID:', blockId);
    
    if (!blockId || isNaN(blockId)) {
      throw new Error('Invalid block ID');
    }

    const response = await fetch(`${API_URL}/api/blocks/${blockId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete block');
    }
    
    return { blockId };
  }
);

// FIXED: Use FloorFormData instead of Omit<Floor, 'floor_id'>
export const addFloor = createAsyncThunk(
  'rooms/addFloor',
  async (floorData: FloorFormData) => {
    const response = await fetch(`${API_URL}/api/floors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(floorData),
    });
    if (!response.ok) throw new Error('Failed to add floor');
    return response.json();
  }
);

// FIXED: Use Partial<FloorFormData> for updates
export const updateFloor = createAsyncThunk(
  'rooms/updateFloor',
  async ({ floorId, floorData }: { floorId: number; floorData: Partial<FloorFormData> }) => {
    console.log('Updating floor with ID:', floorId);
    
    if (!floorId || isNaN(floorId)) {
      throw new Error('Invalid floor ID');
    }

    const response = await fetch(`${API_URL}/api/floors/${floorId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(floorData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update floor');
    }
    
    return response.json();
  }
);

export const deleteFloor = createAsyncThunk(
  'rooms/deleteFloor',
  async (floorId: number) => {
    console.log('Deleting floor with ID:', floorId);
    
    if (!floorId || isNaN(floorId)) {
      throw new Error('Invalid floor ID');
    }

    const response = await fetch(`${API_URL}/api/floors/${floorId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete floor');
    }
    
    return { floorId };
  }
);

// FIXED: Use RoomFormData instead of Omit<Room, 'room_id'>
export const addRoom = createAsyncThunk(
  'rooms/addRoom',
  async (roomData: RoomFormData) => {
    const response = await fetch(`${API_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) throw new Error('Failed to add room');
    return response.json();
  }
);

// FIXED: Use Partial<RoomFormData> for updates instead of Partial<Room>
export const updateRoom = createAsyncThunk(
  'rooms/updateRoom',
  async ({ roomId, roomData }: { roomId: number; roomData: Partial<RoomFormData> }) => {
    const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomData),
    });
    if (!response.ok) throw new Error('Failed to update room');
    return response.json();
  }
);

export const deleteRoom = createAsyncThunk(
  'rooms/deleteRoom',
  async (roomId: number) => {
    console.log('Deleting room with ID:', roomId);
    
    if (!roomId || isNaN(roomId)) {
      throw new Error('Invalid room ID');
    }

    const response = await fetch(`${API_URL}/api/rooms/${roomId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete room');
    }
    
    return { roomId };
  }
);

const roomSlice = createSlice({
  name: 'rooms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blocks
      .addCase(fetchBlocks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlocks.fulfilled, (state, action) => {
        state.loading = false;
        state.blocks = action.payload;
      })
      .addCase(fetchBlocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch blocks';
      })
      
      // Fetch floors
      .addCase(fetchFloors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFloors.fulfilled, (state, action) => {
        state.loading = false;
        state.floors = action.payload;
      })
      .addCase(fetchFloors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch floors';
      })
      
      // Fetch rooms
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
        state.error = null;
        console.log('Rooms set in state:', action.payload.length);
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch rooms';
      })
      
      // Add block
      .addCase(addBlock.fulfilled, (state, action) => {
        state.blocks.push(action.payload);
        state.successMessage = 'Block added successfully';
      })
      .addCase(addBlock.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add block';
      })
      
      // Update block
      .addCase(updateBlock.fulfilled, (state, action) => {
        const updatedBlock = action.payload;
        const index = state.blocks.findIndex(block => block.block_id === updatedBlock.block_id);
        if (index !== -1) {
          state.blocks[index] = updatedBlock;
        }
        state.successMessage = 'Block updated successfully';
      })
      .addCase(updateBlock.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update block';
      })
      
      // Delete block
      .addCase(deleteBlock.fulfilled, (state, action) => {
        state.blocks = state.blocks.filter(block => block.block_id !== action.payload.blockId);
        state.successMessage = 'Block deleted successfully';
      })
      .addCase(deleteBlock.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete block';
      })
      
      // Add floor
      .addCase(addFloor.fulfilled, (state, action) => {
        state.floors.push(action.payload);
        state.successMessage = 'Floor added successfully';
      })
      .addCase(addFloor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add floor';
      })
      
      // Update floor
      .addCase(updateFloor.fulfilled, (state, action) => {
        const updatedFloor = action.payload;
        const index = state.floors.findIndex(floor => floor.floor_id === updatedFloor.floor_id);
        if (index !== -1) {
          state.floors[index] = updatedFloor;
        }
        state.successMessage = 'Floor updated successfully';
      })
      .addCase(updateFloor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update floor';
      })
      
      // Delete floor
      .addCase(deleteFloor.fulfilled, (state, action) => {
        state.floors = state.floors.filter(floor => floor.floor_id !== action.payload.floorId);
        state.successMessage = 'Floor deleted successfully';
      })
      .addCase(deleteFloor.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete floor';
      })
      
      // Add room
      .addCase(addRoom.fulfilled, (state, action) => {
        state.rooms.push(action.payload);
        state.successMessage = 'Room added successfully';
      })
      .addCase(addRoom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to add room';
      })
      
      // Update room
      .addCase(updateRoom.fulfilled, (state, action) => {
        const updatedRoom = action.payload;
        const index = state.rooms.findIndex(room => room.room_id === updatedRoom.room_id);
        if (index !== -1) {
          state.rooms[index] = updatedRoom;
        }
        state.successMessage = 'Room updated successfully';
      })
      .addCase(updateRoom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to update room';
      })
      
      // Delete room
      .addCase(deleteRoom.fulfilled, (state, action) => {
        state.rooms = state.rooms.filter(room => room.room_id !== action.payload.roomId);
        state.successMessage = 'Room deleted successfully';
      })
      .addCase(deleteRoom.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete room';
      });
  },
});

export const { clearError, clearSuccessMessage } = roomSlice.actions;
export default roomSlice.reducer;