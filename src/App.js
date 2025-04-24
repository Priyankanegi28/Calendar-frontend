import CalendarView from './components/CalendarView';
import Sidebar from './components/Sidebar';
import './styles.css';

const App = () => (
  <div className="app">
    <Sidebar />
    <CalendarView />
  </div>
);

export default App;
