import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API = `${process.env.REACT_APP_API_URL}/api/events`;

export const fetchGoals = createAsyncThunk('goals/fetch', async () => {
  const res = await axios.get(`${API}/goals`);
  return res.data;
});

export const fetchTasks = createAsyncThunk('tasks/fetch', async (goalId) => {
  const res = await axios.get(`${API}/tasks/${goalId}`);
  return res.data;
});

const goalSlice = createSlice({
  name: 'goal',
  initialState: {
    goals: [],
    tasks: [],
    selectedGoal: null
  },
  reducers: {
    selectGoal: (state, action) => {
      state.selectedGoal = action.payload;
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.goals = action.payload;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.tasks = action.payload;
      });
  }
});

export const { selectGoal } = goalSlice.actions;
export default goalSlice.reducer;
