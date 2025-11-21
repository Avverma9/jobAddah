import HomeScreen from "./pages/homescreen"
import PostDetail from "./pages/post"

function App() {
  // Simple client-side routing without react-router
  const params = new URLSearchParams(window.location.search);
  const id = params.get('_id');

  if (window.location.pathname.startsWith('/post') || id) {
    return <PostDetail />;
  }

  return (
    <>
      <HomeScreen />
    </>
  )
}

export default App
