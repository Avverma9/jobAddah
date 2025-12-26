import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Footer from "./components/footer";
import ScrollToTop from "./components/ScrollToTop";
import ConsentBanner from "./components/ConsentBanner";
import Header from "./components/Header";
import { HelmetProvider } from "react-helmet-async";
import { LoaderProvider } from "./components/GlobalLoader";
import useIsMobile from "./hooks/useIsMobile";
import Ad160x600 from "./components/ads/Ad160x600";
import Loader from "./components/Loader";

// Lazy load pages for better performance (Code Splitting)
const HomeScreen = lazy(() => import("./pages/homescreen"));
const PostDetail = lazy(() => import("./pages/post"));
const ViewAll = lazy(() => import("./pages/view-all"));
const PrivateJobs = lazy(() => import("./pages/private-jobs"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/TermsAndConditions"));
const ImageResize = lazy(() => import("./pages/tools/imageResize"));
const TypingTest = lazy(() => import("./pages/tools/typingTest"));
const PdfTool = lazy(() => import("./pages/tools/pdfTool"));
const ResumeMaker = lazy(() => import("./pages/tools/resumeMaker"));
const QuizApp = lazy(() => import("./pages/tools/quizApp"));
// const NotAvailable = lazy(() => import("./pages/NotAvailable"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
    </div>
  </div>
);

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

            <Suspense fallback={<LoadingFallback />}>
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
                <Route path="/jobsaddah-resume-tools" element={<ResumeMaker/>} />

                <Route path="/jobsaddah-quiz-tools" element={<QuizApp />} />

                {/* fallback */}
                <Route path="*" element={<HomeScreen />} />
              </Routes>
            </Suspense>
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
