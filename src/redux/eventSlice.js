import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import moment from 'moment';

const API = 'http://localhost:5000/api/events';

// Helper function to format event dates - converts to ISO string for Redux storage
const formatEventDates = (event) => {
  console.log('Formatting event for storage:', event);
  try {
    const formattedEvent = {
      ...event,
      start: moment(event.start).toISOString(),
      end: moment(event.end).toISOString(),
      title: event.title || 'Untitled Event',
      color: event.color || '#3f51b5'
    };
    console.log('Formatted event:', formattedEvent);
    return formattedEvent;
  } catch (error) {
    console.error('Error formatting event:', error);
    throw error;
  }
};

export const fetchEvents = createAsyncThunk(
  'events/fetch',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching events from:', API);
      const res = await axios.get(API);
      console.log('Raw response from API:', res);
      console.log('Received events data:', res.data);
      
      if (!Array.isArray(res.data)) {
        console.error('API did not return an array:', res.data);
        return rejectWithValue('Invalid data format received from server');
      }

      const formattedEvents = res.data.map(event => {
        console.log('Processing event from API:', event);
        return formatEventDates(event);
      });
      
      console.log('Final formatted events:', formattedEvents);
      return formattedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch events');
    }
  }
);

export const addEvent = createAsyncThunk(
  'events/add',
  async (data, { rejectWithValue }) => {
    try {
      console.log('Adding event:', data);
      const res = await axios.post(API, data);
      console.log('Added event response:', res.data);
      return formatEventDates(res.data);
    } catch (error) {
      console.error('Error adding event:', error);
      return rejectWithValue(error.response?.data || 'Failed to add event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log('Updating event:', id, data);
      const res = await axios.put(`${API}/${id}`, data);
      console.log('Updated event response:', res.data);
      return formatEventDates(res.data);
    } catch (error) {
      console.error('Error updating event:', error);
      return rejectWithValue(error.response?.data || 'Failed to update event');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, { rejectWithValue }) => {
    try {
      console.log('Deleting event:', id);
      await axios.delete(`${API}/${id}`);
      return id;
    } catch (error) {
      console.error('Error deleting event:', error);
      return rejectWithValue(error.response?.data || 'Failed to delete event');
    }
  }
);

const eventSlice = createSlice({
  name: 'event',
  initialState: {
    events: [],
    loading: false,
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: builder => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
        console.log('Fetching events...');
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
        console.log('Events fetched and stored:', state.events);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to fetch events:', action.payload);
      })
      // Add event
      .addCase(addEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events.push(action.payload);
        console.log('Event added successfully:', action.payload);
      })
      .addCase(addEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to add event:', action.payload);
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loading = false;
        const updatedEvent = action.payload;
        const eventId = updatedEvent._id || updatedEvent.id;
        
        // Find the exact event to update
        const idx = state.events.findIndex(e => 
          (e._id === eventId || e.id === eventId) && 
          moment(e.start).isSame(moment(updatedEvent.start), 'day')
        );
        
        if (idx > -1) {
          state.events[idx] = updatedEvent;
          console.log('Event updated successfully:', updatedEvent);
        } else {
          console.warn('Could not find event to update:', eventId);
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to update event:', action.payload);
      })
      // Delete event
      .addCase(deleteEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.events = state.events.filter(e => e._id !== action.payload && e.id !== action.payload);
        console.log('Event deleted successfully:', action.payload);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('Failed to delete event:', action.payload);
      });
  }
});

export const { clearError } = eventSlice.actions;
export default eventSlice.reducer;
