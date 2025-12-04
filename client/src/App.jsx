import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/homescreen";
import PostDetail from "./pages/post";
import ViewAll from "./pages/view-all";
import PrivateJobs from "./pages/private-jobs";
import Footer from "./components/footer";
import ScrollToTop from "./components/ScrollToTop";
import ConsentBanner from './components/ConsentBanner';

function App() {
  return (
    <Router>
      <ScrollToTop />
        <ConsentBanner />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/post" element={<PostDetail />} />
        <Route path="/view-all" element={<ViewAll />} />
        <Route path="/private-jobs" element={<PrivateJobs />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/result" element={<HomeScreen />} />
        <Route path="/admit-card" element={<HomeScreen />} />
        <Route path="/latest-jobs" element={<HomeScreen />} />
        {/* Fallback to home for unknown routes */}
        <Route path="*" element={<HomeScreen />} />


      </Routes>
    <Footer/>
    </Router>
  );
}

export default App;
