import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// 1. Fetch existing tasks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch');
  }
});

// 2. Create a new task
export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create');
  }
});

// 3. Update a task
export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update');
  }
});

// 4. Delete a task
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    const token = localStorage.getItem('token');
    await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return id; // Return the ID so we can remove it from the state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete');
  }
});

// 3. The Redux Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle Fetching
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.items = action.payload; // Put the database tasks into Redux
      })
      // Handle Creating
      .addCase(createTask.pending, (state) => {
        state.loading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload); // Add the new task to the top of the array
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle Updating
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload; // Replace old task with updated task
        }
      })
      // Handle Deleting
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload); // Remove by ID
      });
  },
});

export default taskSlice.reducer;

// ==========================================
// SELECTORS (How we read data from the store)
// ==========================================
export const selectTasks = (state) => state.tasks.items;
export const selectTasksLoading = (state) => state.tasks.loading;

// This automatically calculates our stats for the Dashboard!
export const selectTaskStats = (state) => {
  const tasks = state.tasks.items;
  return {
    total: tasks.length,
    completed: tasks.filter(task => task.stage === 3).length, // Stage 3 is 'Done'
    pending: tasks.filter(task => task.stage !== 3).length  // Anything else is pending
  };
};

export const selectTasksByStage = (stageId) => (state) => {
  return state.tasks.items.filter((task) => task.stage === stageId);
};