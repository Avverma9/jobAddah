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
import ImageResize from "./pages/tools/imageResize";
import { HelmetProvider } from "react-helmet-async";
import { LoaderProvider } from "./components/GlobalLoader";
import TypingTest from "./pages/tools/typingTest";
import PdfTool from "./pages/tools/pdfTool";
import ResumeMaker from "./pages/tools/resumeMaker";
import QuizApp from "./pages/tools/quizApp";
import useIsMobile from "./hooks/useIsMobile";
import Ad160x600 from "./components/ads/Ad160x600";
import AdBanner728x90 from "./components/ads/Adsetra728x90";

function App() {
  const isMobile = useIsMobile(640);

  return (
    <HelmetProvider>
      <LoaderProvider>
        <Router>
          <ScrollToTop />

          {/* Header only for desktop */}
          {!isMobile && <Header />}

          {/* Main content — HEADER HEIGHT OFFSET only for desktop */}
          <main className={`min-h-screen bg-gray-50 dark:bg-gray-950 ${!isMobile ? 'pt-16' : ''}`}>
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
              {/* <Route path="/not-available" element={<NotAvailable />} /> */}

              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />

              {/* Tools */}
              <Route path="/jobsaddah-image-tools" element={<ImageResize />} />
              <Route path="/jobsaddah-typing-tools" element={<TypingTest />} />
              <Route path="/jobsaddah-pdf-tools" element={<PdfTool />} />
              <Route path="/jobsaddah-resume-tools" element={< ResumeMaker/>} />

              <Route path="/jobsaddah-quiz-tools" element={<QuizApp />} />



              {/* fallback */}
              <Route path="*" element={<HomeScreen />} />
            </Routes>
          </main>

          {/* Footer only for desktop */}
          {!isMobile && <Footer />}
          {/* Large vertical banner across pages for very wide screens */}
          {!isMobile && (
            <div className="hidden 2xl:flex fixed right-8 top-28 z-40">
              <Ad160x600 />
            </div>
          )}
        </Router>
      </LoaderProvider>
    </HelmetProvider>
  );
}

export default App;
