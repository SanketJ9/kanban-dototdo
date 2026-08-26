import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/tasks';

// Helper to get auth headers
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
});

// ==========================================
// ASYNC THUNKS (API calls)
// ==========================================

// Fetch all tasks
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(API_URL, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
  }
});

// Create a new task
export const createTask = createAsyncThunk('tasks/createTask', async (taskData, { rejectWithValue }) => {
  try {
    const response = await axios.post(API_URL, taskData, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create task');
  }
});

// Update a task
export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, updates }, { rejectWithValue }) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, updates, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to update task');
  }
});

// Delete a task
export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeaders());
    return id; // Return the id so we can remove it from the state
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
  }
});

// Move a task to a different stage
export const moveTask = createAsyncThunk('tasks/moveTask', async ({ id, stage }, { rejectWithValue }) => {
  try {
    const response = await axios.patch(`${API_URL}/${id}/move`, { stage }, getAuthHeaders());
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to move task');
  }
});

// ==========================================
// SLICE
// ==========================================

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],       // Array of all tasks
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Tasks ---
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // --- Create Task ---
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // Add to the beginning
      })
      .addCase(createTask.rejected, (state, action) => {
        state.error = action.payload;
      })

      // --- Update Task ---
      .addCase(updateTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      })

      // --- Delete Task ---
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t._id !== action.payload);
      })

      // --- Move Task ---
      .addCase(moveTask.fulfilled, (state, action) => {
        const index = state.items.findIndex((t) => t._id === action.payload._id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export const { clearTaskError } = taskSlice.actions;

// ==========================================
// SELECTORS (Derive stats from the tasks array)
// ==========================================

export const selectAllTasks = (state) => state.tasks.items;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTaskError = (state) => state.tasks.error;

// Derived stats — no separate API call needed!
export const selectTaskStats = (state) => {
  const tasks = state.tasks.items;
  const total = tasks.length;
  const backlog = tasks.filter((t) => t.stage === 0).length;
  const todo = tasks.filter((t) => t.stage === 1).length;
  const ongoing = tasks.filter((t) => t.stage === 2).length;
  const completed = tasks.filter((t) => t.stage === 3).length;

  return { total, backlog, todo, ongoing, completed, pending: total - completed };
};

// Select tasks by stage
export const selectTasksByStage = (stage) => (state) =>
  state.tasks.items.filter((t) => t.stage === stage);

export default taskSlice.reducer;
