import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ExplorePage from './pages/ExplorePage';
import BookDetailsPage from './pages/BookDetailsPage';
import DashboardPage from './pages/DashboardPage';
import MyListsPage from './pages/MyListsPage';
import NotesPage from './pages/NotesPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ReaderPage from './pages/ReaderPage';
import PublicProfilePage from './pages/PublicProfilePage';
import DiscoverPage from './pages/DiscoverPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ChallengesPage from './pages/ChallengesPage';
import FavoritesPage from './pages/FavoritesPage';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            {/* Placeholders for future routes */}
            <Route path="discover" element={<DiscoverPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="explore" element={<ExplorePage />} />
            <Route path="book/:id" element={<BookDetailsPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="my-books" element={<MyListsPage />} />
            <Route path="challenges" element={<ChallengesPage />} />
            <Route path="notes" element={<NotesPage />} />
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="reader/:id" element={<ReaderPage />} />
            <Route path="users/:username" element={<PublicProfilePage />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
}

export default App;
