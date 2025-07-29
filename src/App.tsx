import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import LoginPage from "./pages/LoginPage"
import AdminLayout from "./layouts/AdminLayout"
import DashboardPage from "./pages/admin/DashboardPage"
import UsersPage from "./pages/admin/UsersPage"
import RolesPage from "./pages/admin/RolesPage"
import CategoriesPage from "./pages/admin/CategoriesPage"
import PositionsGradesPage from "./pages/admin/PositionsGradesPage"
import ProgramsPage from "./pages/admin/ProgramsPage"
import StudentsPage from "./pages/admin/StudentsPage"
import EventsPage from "./pages/admin/EventsPage"
import GalleryPage from "./pages/admin/GalleryPage"
import NewsPage from "./pages/admin/NewsPage"
import DownloadsPage from "./pages/admin/DownloadsPage"
import ProtectedRoute from "./components/ProtectedRoute"

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="roles" element={<RolesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="positions-grades" element={<PositionsGradesPage />} />
          <Route path="programs" element={<ProgramsPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="downloads" element={<DownloadsPage />} />
        </Route>
      </Routes>
      <Toaster />
    </>
  )
}

export default App
