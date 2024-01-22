import './App.css';
import 'react-notifications/lib/notifications.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ApotekaPage from './pages/ApotekaPage';
import FarmaceutskaKucaPage from './pages/FarmaceutskaKucaPage';
import GrupaLekovaPage from './pages/GrupaLekovaPage';
import LekPage from './pages/LekPage';
import MainLayout from './layout/MainLayout';
import { NotificationContainer } from 'react-notifications';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<MainLayout><HomePage /></MainLayout>}/>
        <Route path="/apoteka" element={<MainLayout><ApotekaPage /></MainLayout>}/>
        <Route path="/farmaceutskekuce" element={<MainLayout><FarmaceutskaKucaPage /></MainLayout>}/>
        <Route path="/grupelekova" element={<MainLayout><GrupaLekovaPage /></MainLayout>}/>
        <Route path="/lekovi" element={<MainLayout><LekPage /></MainLayout>}/>
      </Routes>
      <NotificationContainer />
    </Router>
  );
}

export default App;
