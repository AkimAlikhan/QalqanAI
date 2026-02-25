import { HashRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import MilkyWay from './components/MilkyWay';
import Chat from './components/Chat';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Ecosystem from './pages/Ecosystem';
import HowItWorks from './pages/HowItWorks';
import Blocklist from './pages/Blocklist';
import Contact from './pages/Contact';
import DeepAnalyze from './pages/DeepAnalyze';
import './App.css';

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <div className="app-layout">
          <MilkyWay />
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/deep-analyze" element={<DeepAnalyze />} />
              <Route path="/ecosystem" element={<Ecosystem />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/blocklist" element={<Blocklist />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
          </main>
          <Chat />
        </div>
      </HashRouter>
    </LanguageProvider>
  );
}
