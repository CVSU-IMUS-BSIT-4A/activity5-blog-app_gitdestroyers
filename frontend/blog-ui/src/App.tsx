import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthPage, PostsPage, Profile, Post, Protected } from './components';
import { Toaster } from './components/ui/sonner';
import { useTheme } from './hooks/useTheme';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { useEffect } from 'react';

function AppContent() {
  const { isDarkMode } = useTheme();
  
  // Set default app title
  useDocumentTitle('');

  useEffect(() => {
    // Apply initial theme
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);


  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Protected><PostsPage /></Protected>} />
        {/* UserPage route removed */}
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="/post/:postId" element={<Protected><Post /></Protected>} />
        {/* Catch-all route - redirect to home */}
        <Route path="*" element={<Protected><PostsPage /></Protected>} />
      </Routes>
      <Toaster 
        position="bottom-right" 
        toastOptions={{
          style: {
            margin: '8px',
            maxWidth: '250px',
          },
        }}
      />
    </BrowserRouter>
  );
}

export default function App() {
  return <AppContent />;
}

