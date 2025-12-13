import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomeScreen from "./pages/homescreen";
import PostDetail from "./pages/post";
import ViewAll from "./pages/view-all";
import PrivateJobs from "./pages/private-jobs";
import Footer from "./components/footer";
import ScrollToTop from "./components/ScrollToTop";
import ConsentBanner from "./components/ConsentBanner";
import NotAvailable from "./pages/NotAvailable";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/TermsAndConditions";
import Header from "./components/Header";
import { HelmetProvider } from "react-helmet-async";
function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />

        {/* Header always on top */}
        <Header />

        {/* Main content — HEADER HEIGHT OFFSET */}
        <main className="pt-16 min-h-screen bg-gray-50 dark:bg-gray-950">
          <ConsentBanner />

          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/latest-jobs" element={<HomeScreen />} />
            <Route path="/result" element={<HomeScreen />} />
            <Route path="/admit-card" element={<HomeScreen />} />

            <Route path="/post" element={<PostDetail />} />
            <Route path="/view-all" element={<ViewAll />} />
            <Route path="/private-jobs" element={<PrivateJobs />} />
            <Route path="/not-available" element={<NotAvailable />} />

            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />

            {/* fallback */}
            <Route path="*" element={<HomeScreen />} />
          </Routes>
        </main>

        <Footer />
      </Router>
    </HelmetProvider>
  );
}

export default App;
