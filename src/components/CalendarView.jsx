import moment from 'moment';
import { useEffect, useState, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchEvents,
  updateEvent,
  clearError
} from '../redux/eventSlice';
import EventModal from './EventModal';
import {colorMap} from './EventModal';
const localizer = momentLocalizer(moment);

const categoryColors = {
  exercise: '#8bc34a',
  eating: '#ff9800',
  work: '#3f51b5',
  family: '#f44336',
  social: '#2196f3',
  default: '#757575'
};

const CalendarView = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.event);
  const [modalData, setModalData] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [processedEvents, setProcessedEvents] = useState([]);

  // Process events with proper date handling
  useEffect(() => {
    if (!Array.isArray(events)) {
      console.error('Events is not an array:', events);
      setProcessedEvents([]);
      return;
    }

    const processed = events.map(event => {
      try {
        const startDate = new Date(event.start);
        const endDate = new Date(event.end);

        if (isNaN(startDate.getTime())) {
          console.warn('Invalid start date in event:', event);
          return null;
        }
        if (isNaN(endDate.getTime())) {
          console.warn('Invalid end date in event:', event);
          return null;
        }

        return {
          ...event,
          id: event._id || event.id,
          start: startDate,
          end: endDate,
          title: event.title || 'Untitled Event',
          color: event.color || categoryColors[event.category] || categoryColors.default,
          category: event.category || 'default',
        };
      } catch (error) {
        console.error('Error processing event:', event, error);
        return null;
      }
    }).filter(event => event !== null);

    setProcessedEvents(processed);
  }, [events]);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const onSelectSlot = useCallback(({ start, end }) => {
    setModalType('add');
    setModalData({ start, end });
  }, []);

  const onSelectEvent = useCallback((event) => {
    setModalType('edit');
    setModalData({ event });
  }, []);

  const onEventDrop = useCallback(({ event, start, end }) => {
    if (!event.id) {
      console.warn('Event missing id:', event);
      return;
    }

    dispatch(updateEvent({
      id: event.id,
      data: {
        ...event,
        start,
        end,
      }
    }));
  }, [dispatch]);

  const onEventResize = useCallback(({ event, start, end }) => {
    if (!event.id) {
      console.warn('Event missing id:', event);
      return;
    }

    dispatch(updateEvent({
      id: event.id,
      data: {
        ...event,
        start,
        end,
      }
    }));
  }, [dispatch]);

  const closeModal = useCallback(() => {
    setModalData(null);
    setModalType(null);
  }, []);

  const formatEventTitle = useCallback((event) => {
    const time = moment(event.start).format('HH:mm');
    return `${time} - ${event.title}`;
  }, []);

  const eventPropGetter = useCallback((event) => ({
    style: {
      backgroundColor: event.color || categoryColors[event.category] || categoryColors.default,
      color: '#87CEEB',
      borderRadius: '4px',
      padding: '2px 5px',
      fontSize: '1rem',
      border: 'none',
      display: 'block',
    }
  }), []);

  return (
    <div className="calendar-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {error && (
        <div style={{ color: 'red', padding: '10px', background: '#ffeeee' }}>
          Error: {error}
        </div>
      )}

      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255,255,255,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div>Loading calendar events...</div>
        </div>
      )}

      <div style={{ flex: 1, padding: '10px' }}>
        <Calendar
          localizer={localizer}
          events={processedEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor={formatEventTitle}
          selectable
          resizable
          draggableAccessor={() => true}
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          style={{ height: '100%' }}
          popup
          views={['month', 'week', 'day', 'agenda']}
          defaultView="week"
          step={30}
          timeslots={2}
          eventPropGetter={eventPropGetter}
          formats={{
            eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
            timeGutterFormat: 'HH:mm',
          }}
        />
      </div>

      {modalData && (
        <EventModal
          data={modalData}
          modalType={modalType}
          closeModal={closeModal}
        />
      )}
    </div>
  );
};

export default CalendarView;