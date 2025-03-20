
import { BrowserRouter } from 'react-router-dom'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './App.css'
import { Toaster } from './components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStatus } from './hooks/useAuthStatus'
import { LoadingScreen } from './components/app/LoadingScreen'
import { ConnectionErrorScreen } from './components/app/ConnectionErrorScreen'
import { PermissionErrorScreen } from './components/app/PermissionErrorScreen'
import { AppRoutes } from './components/app/AppRoutes'

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 401/403 errors
        if (
          error instanceof Error && 
          'status' in error && 
          (error.status === 401 || error.status === 403)
        ) {
          return false
        }
        // Limit retries to 3
        return failureCount < 3
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Add shorter timeout to prevent infinite loading
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  const { isLoading, isAuthenticated, connectionError, permissionError } = useAuthStatus();

  // Show a simpler loading state that won't get stuck
  if (isLoading) {
    return <LoadingScreen />;
  }

  if (connectionError) {
    return <ConnectionErrorScreen onRetry={() => window.location.reload()} />;
  }

  if (permissionError && isAuthenticated) {
    return <PermissionErrorScreen onRetry={() => window.location.reload()} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SonnerToaster richColors position="top-center" />
        <AppRoutes isAuthenticated={isAuthenticated} />
        <Toaster />
        <ReactQueryDevtools initialIsOpen={false} />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
