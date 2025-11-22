import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./admin/login";
import HomeScreen from "./pages/homescreen"
import PostDetail from "./pages/post"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/post" element={<PostDetail />} />
        <Route path="/admin-section-jobaddah" element={<Login />} />
        {/* Fallback to home for unknown routes */}
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App
