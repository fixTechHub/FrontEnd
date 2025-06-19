import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { checkAuthThunk } from './features/auth/authSlice'
import AppRoutes from './routes'
import AppProvider from './app/AppProvider'

const AppContent = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(checkAuthThunk())
  }, [dispatch])

  return (
    <>
      <AppRoutes />
    </>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
