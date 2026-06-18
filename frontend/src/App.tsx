import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import { ThemeProvider } from './contexts/ThemeContext';
import Analytics from './components/Analytics';

// Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import MassSchedule from './pages/MassSchedule';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Events from './pages/Events';
import Ministries from './pages/Ministries';
import Sacraments from './pages/Sacraments';
import Gallery from './pages/Gallery';
import Prayers from './pages/Prayers';
import Sermons from './pages/Sermons';
import OrderOfTheMass from './pages/OrderOfTheMass';
import Benediction from './pages/Benediction';
import Confession from './pages/Confession';
import Contact from './pages/Contact';
import Donations from './pages/Donations';
import DonationSuccess from './pages/DonationSuccess';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Register from './pages/Register';
import ViewProfile from './pages/ViewProfile';
import EditProfile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import Login from './pages/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import ManageMassSchedule from './pages/admin/ManageMassSchedule';
import ManageEvents from './pages/admin/ManageEvents';
import ManageMinistries from './pages/admin/ManageMinistries';
import ManageGallery from './pages/admin/ManageGallery';
import ManagePrayers from './pages/admin/ManagePrayers';
import ManageSermons from './pages/admin/ManageSermons';
import ManageMissionStations from './pages/admin/ManageMissionStations';
import ManageLiturgicalColors from './pages/admin/ManageLiturgicalColors';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDonations from './pages/admin/ManageDonations';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return isAuthenticated() ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <Analytics />
      <Router>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/parish-info" element={<AboutUs />} />
        <Route path="/mass-schedule" element={<MassSchedule />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/announcements/:id" element={<AnnouncementDetail />} />
        <Route path="/events" element={<Events />} />
        <Route path="/ministries" element={<Ministries />} />
        <Route path="/sacraments" element={<Sacraments />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/prayers" element={<Prayers />} />
        <Route path="/sermons" element={<Sermons />} />
        <Route path="/order-of-the-mass" element={<OrderOfTheMass />} />
        <Route path="/benediction" element={<Benediction />} />
        <Route path="/confession" element={<Confession />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/donations" element={<Donations />} />
        <Route path="/donations/success" element={<DonationSuccess />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<ViewProfile />} />
        <Route path="/profile/:id" element={<ViewProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/edit/:id" element={<EditProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile/change-password" element={<ChangePassword />} />

        {/* Admin Routes */}
        {/* <Route path="/login" element={<AdminLogin />} /> */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/announcements"
          element={
            <ProtectedRoute>
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mass-schedule"
          element={
            <ProtectedRoute>
              <ManageMassSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ministries"
          element={
            <ProtectedRoute>
              <ManageMinistries />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute>
              <ManageGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prayers"
          element={
            <ProtectedRoute>
              <ManagePrayers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sermons"
          element={
            <ProtectedRoute>
              <ManageSermons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mission-stations"
          element={
            <ProtectedRoute>
              <ManageMissionStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/liturgical-colors"
          element={
            <ProtectedRoute>
              <ManageLiturgicalColors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute>
              <ManageDonations />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

