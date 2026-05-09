import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar.jsx';
import ExpertsPage from './pages/ExpertsPage.jsx';
import ExpertDetailPage from './pages/ExpertDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#F8F7F5]">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<ExpertsPage />} />
            <Route path="/experts/:id" element={<ExpertDetailPage />} />
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#1a2332',
            border: '1px solid #E8E5E1',
            borderRadius: '8px',
            fontSize: '14px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          },
          success: {
            iconTheme: { primary: '#5E8374', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#DC2626', secondary: '#fff' },
          },
        }}
      />
    </BrowserRouter>
  );
}
