import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MilkyWay from './components/MilkyWay';
import Chat from './components/Chat';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Ecosystem from './pages/Ecosystem';
import HowItWorks from './pages/HowItWorks';
import Blocklist from './pages/Blocklist';
import './App.css';

export default function App() {
  return (
    <HashRouter>
      <div className="app-layout">
        <MilkyWay />
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/ecosystem" element={<Ecosystem />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/blocklist" element={<Blocklist />} />
          </Routes>
        </main>
        <Chat />
      </div>
    </HashRouter>
  );
}
