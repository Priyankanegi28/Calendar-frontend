import moment from 'moment';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGoals, fetchTasks, selectGoal } from '../redux/goalSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const { goals, tasks, selectedGoal } = useSelector(state => state.goal);
  const { events } = useSelector(state => state.event);

  useEffect(() => {
    dispatch(fetchGoals());
  }, [dispatch]);

  const handleGoalClick = goal => {
    dispatch(selectGoal(goal));
    dispatch(fetchTasks(goal._id));
  };

  return (
    <div className="sidebar" style={{ padding: '1rem', width: '250px', backgroundColor: '#f5f5f5' }}>
      <h3>Goals</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {events.map(event => (
          <li 
            key={event._id}
            style={{
              padding: '8px',
              marginBottom: '4px',
              backgroundColor: event.color || '#3f51b5',
              color: 'white',
              borderRadius: '4px'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{event.title}</div>
            <div style={{ fontSize: '0.8rem' }}>
              {moment(event.start).format('MMM D, YYYY')}
            </div>
            <div style={{ fontSize: '0.8rem' }}>
              {moment(event.start).format('h:mm a')} - {moment(event.end).format('h:mm a')}
            </div>
          </li>
        ))}
      </ul>

      {selectedGoal && (
        <>
          <h4>Tasks for {typeof selectedGoal.name === 'string' ? selectedGoal.name : 'Unknown Goal'}</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {tasks.map(task => (
              <li 
                key={task._id}
                style={{
                  padding: '8px',
                  marginBottom: '4px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '4px'
                }}
              >
                {task.name}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Sidebar;
