import { Route, Routes, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from "./component/login";
import Dashboard from "./dashboard/dashboard";
import CreateJob from "./pages/CreateJob";
import JobEdit from "./component/JobEdit";
import Layout from "./dashboard/Layout";
import AllJobs from "./pages/AllJobs";
import AllAdmitCards from "./pages/AllAdmitCards";
import AllResults from "./pages/AllResults";
import AllExams from "./pages/AllExams";
import AllAnswerKeys from "./pages/AllAnswerKeys";
import MenuItemsPage from "./pages/admin/MenuItems";
import ManageUsers from "./pages/admin/ManageUsers";
import ModelSelector from "./pages/admin/Ai-integration";

const ProtectedRoute = () => {
  const { isAuthenticated } = useSelector((state) => state.user);
  return isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public route without layout */}
      <Route path="/" element={<LoginPage />} />

      {/* Routes that use the main layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-job" element={<CreateJob />} />
          <Route path="/dashboard/job-edit/:id" element={<JobEdit />} />
          <Route path="/dashboard/all-jobs" element={<AllJobs />} />
          <Route path="/dashboard/admit-cards" element={<AllAdmitCards />} />
          <Route path="/dashboard/results" element={<AllResults />} />
          <Route path="/dashboard/exams" element={<AllExams />} />
          <Route path="/dashboard/answer-keys" element={<AllAnswerKeys />} />
          <Route path="/admin-menu-items" element={<MenuItemsPage />} />
          <Route path="/admin-manage/users" element={<ManageUsers />} />
          <Route path="/ai-integrate" element={<ModelSelector />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
