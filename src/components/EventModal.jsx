import moment from 'moment';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { addEvent, deleteEvent, updateEvent } from '../redux/eventSlice';

const categories = ['exercise', 'eating', 'work', 'relax', 'family', 'social'];

const colorMap = {
  exercise: '#8bc34a',
  eating: '#ff9800',
  work: '#3f51b5',
  relax: '#9c27b0',
  family: '#f44336',
  social: '#2196f3',
};

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    width: '400px',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1000
  }
};

const EventModal = ({ data, modalType, closeModal }) => {
  const dispatch = useDispatch();
  const isEdit = modalType === 'edit';
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (isEdit && data.event) {
      setTitle(data.event.title || '');
      setCategory(data.event.category || categories[0]);
      setStartTime(data.event.start ? moment(data.event.start).format('HH:mm') : '');
      setEndTime(data.event.end ? moment(data.event.end).format('HH:mm') : '');
    } else {
      // Reset form for new events
      setTitle('');
      setCategory(categories[0]);
      setStartTime(moment(data.start).format('HH:mm'));
      setEndTime(moment(data.end).format('HH:mm'));
    }
  }, [data, isEdit]);

  const handleSave = async () => {
    // For edit, use event's original date, for new events use selected slot date
    const startDate = isEdit ? moment(data.event.start) : moment(data.start);
    const endDate = isEdit ? moment(data.event.end) : moment(data.end);

    // Keep the original date but update the time
    if (startTime) {
      const [hours, minutes] = startTime.split(':');
      startDate
        .hours(parseInt(hours))
        .minutes(parseInt(minutes))
        .seconds(0)
        .milliseconds(0);
    }

    if (endTime) {
      const [hours, minutes] = endTime.split(':');
      endDate
        .hours(parseInt(hours))
        .minutes(parseInt(minutes))
        .seconds(0)
        .milliseconds(0);
    }

    // Ensure end time is after start time
    if (endDate.isBefore(startDate)) {
      endDate.add(1, 'day');
    }

    const payload = {
      title: title.trim() || 'Untitled Event',
      category,
      start: startDate.toDate(),
      end: endDate.toDate(),
      color: colorMap[category]
    };

    try {
      if (isEdit && data.event) {
        // Ensure we're using the correct event ID
        const eventId = data.event._id || data.event.id;
        if (eventId) {
          console.log('Updating event with ID:', eventId);
          await dispatch(updateEvent({ 
            id: eventId, 
            data: {
              ...payload,
              _id: eventId // Include the original ID in the update
            }
          })).unwrap();
        }
      } else {
        await dispatch(addEvent(payload)).unwrap();
      }
      closeModal();
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async () => {
    if (isEdit && data.event) {
      const eventId = data.event._id || data.event.id;
      if (eventId) {
        try {
          await dispatch(deleteEvent(eventId)).unwrap();
          closeModal();
        } catch (error) {
          console.error('Failed to delete event:', error);
        }
      }
    }
  };

  return (
    <Modal
      isOpen={true}
      onRequestClose={closeModal}
      style={modalStyles}
      ariaHideApp={false}
    >
      <h2>{isEdit ? 'Edit Event' : 'Add Event'}</h2>

      <div className="form-group">
        <label>Title</label>
        <input
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
        />
      </div>

      <div className="form-group">
        <label>Category</label>
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Start Time</label>
        <input
          className="time-input"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>End Time</label>
        <input
          className="time-input"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>

      <div className="button-group">
        {isEdit && (
          <button className="btn delete" onClick={handleDelete}>
            Delete
          </button>
        )}
        <button className="btn save" onClick={handleSave}>
          {isEdit ? 'Update' : 'Save'}
        </button>
        <button className="btn cancel" onClick={closeModal}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default EventModal;
