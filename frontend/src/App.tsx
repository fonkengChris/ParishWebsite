import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, getStoredUser } from './utils/auth';
import { can, hasAdminAccess, type Resource } from './utils/permissions';
import { ThemeProvider } from './contexts/ThemeContext';
import { ParishProvider } from './contexts/ParishContext';
import { SiteContentProvider } from './contexts/SiteContentContext';
import Analytics from './components/Analytics';

// Public Pages
import Home from './pages/Home';
import AboutUs from './pages/AboutUs';
import MassSchedule from './pages/MassSchedule';
import Announcements from './pages/Announcements';
import AnnouncementDetail from './pages/AnnouncementDetail';
import Events from './pages/Events';
import ParishLife from './pages/ParishLife';
import ParishServices from './pages/ParishServices';
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
import ManageApostolates from './pages/admin/ManageApostolates';
import ManageSacraments from './pages/admin/ManageSacraments';
import ManageParishServices from './pages/admin/ManageParishServices';
import ManageGallery from './pages/admin/ManageGallery';
import ManagePrayers from './pages/admin/ManagePrayers';
import ManageSermons from './pages/admin/ManageSermons';
import ManageMissionStations from './pages/admin/ManageMissionStations';
import ManageLiturgicalColors from './pages/admin/ManageLiturgicalColors';
import ManageUsers from './pages/admin/ManageUsers';
import ManageDonations from './pages/admin/ManageDonations';
import SendMessage from './pages/admin/SendMessage';
import ManageParishSettings from './pages/admin/ManageParishSettings';
import ManageSiteContent from './pages/admin/ManageSiteContent';

// Protected Route Component: anyone who can manage something; with `permission`, only roles that may manage that resource
const ProtectedRoute = ({ children, permission }: { children: React.ReactNode; permission?: Resource }) => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  const user = getStoredUser();
  if (!hasAdminAccess(user)) return <Navigate to="/" replace />;
  if (permission && !can(user, permission)) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider>
      <ParishProvider>
      <SiteContentProvider>
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
        <Route path="/parish-life" element={<ParishLife />} />
        <Route path="/parish-services" element={<ParishServices />} />
        {/* Legacy paths → new pages */}
        <Route path="/ministries" element={<Navigate to="/parish-life" replace />} />
        <Route path="/sacraments" element={<Navigate to="/parish-services" replace />} />
        {/* Gallery is now part of the About page */}
        <Route path="/gallery" element={<Navigate to="/about-us#gallery" replace />} />
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
            <ProtectedRoute permission="Announcements">
              <ManageAnnouncements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/events"
          element={
            <ProtectedRoute permission="Events">
              <ManageEvents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mass-schedule"
          element={
            <ProtectedRoute permission="MassSchedule">
              <ManageMassSchedule />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/apostolates"
          element={
            <ProtectedRoute permission="Apostolates">
              <ManageApostolates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sacraments"
          element={
            <ProtectedRoute permission="Sacraments">
              <ManageSacraments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parish-services"
          element={
            <ProtectedRoute permission="ParishServices">
              <ManageParishServices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <ProtectedRoute permission="Gallery">
              <ManageGallery />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/prayers"
          element={
            <ProtectedRoute permission="Prayers">
              <ManagePrayers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sermons"
          element={
            <ProtectedRoute permission="Sermons">
              <ManageSermons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/mission-stations"
          element={
            <ProtectedRoute permission="MissionStations">
              <ManageMissionStations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/liturgical-colors"
          element={
            <ProtectedRoute permission="LiturgicalColors">
              <ManageLiturgicalColors />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute permission="Users">
              <ManageUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/donations"
          element={
            <ProtectedRoute permission="Donations">
              <ManageDonations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/send-message"
          element={
            <ProtectedRoute permission="Notifications">
              <SendMessage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/parish-settings"
          element={
            <ProtectedRoute permission="ParishConfig">
              <ManageParishSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/site-content"
          element={
            <ProtectedRoute permission="SiteContent">
              <ManageSiteContent />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Router>
      </SiteContentProvider>
      </ParishProvider>
    </ThemeProvider>
  );
}

export default App;

