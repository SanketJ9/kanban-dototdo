import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import TaskManagementPage from './pages/TaskManagementPage'
import './App.css'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/tasks' element={<TaskManagementPage />} />
          <Route path='*' element={<Navigate to='/register' replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
