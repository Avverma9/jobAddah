import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/homescreen";
import PostDetail from "./pages/post";
import ViewAll from "./pages/view-all";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/post" element={<PostDetail />} />
        <Route path="/view-all" element={<ViewAll />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/result" element={<HomeScreen />} />
        <Route path="/admit-card" element={<HomeScreen />} />
        <Route path="/latest-jobs" element={<HomeScreen />} />
        {/* Fallback to home for unknown routes */}
        <Route path="*" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
