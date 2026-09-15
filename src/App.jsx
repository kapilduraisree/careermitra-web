import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from './context/ThemeContext'

// Auth
import Login    from './pages/Login'
import Register from './pages/Register'

// Layout
import Layout from './components/Layout'

// Main pages
import Dashboard     from './pages/Dashboard'
import Jobs          from './pages/Jobs'
import JobDetail     from './pages/JobDetail'
import Exams         from './pages/Exams'
import MockTest      from './pages/MockTest'
import AiMentor      from './pages/AiMentor'
import Profile       from './pages/Profile'
import Applications  from './pages/Applications'
import Roadmap       from './pages/Roadmap'

// New feature pages
import ResumeAnalyzer   from './pages/ResumeAnalyzer'
import MockInterview    from './pages/MockInterview'
import JobScamChecker   from './pages/JobScamChecker'
import CareerComparison from './pages/CareerComparison'
import DailyQuiz        from './pages/DailyQuiz'
import SalaryCalculator from './pages/SalaryCalculator'

const isLoggedIn = () => !!localStorage.getItem('accessToken')

const Protected = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login" replace />

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={<Protected><Layout /></Protected>}>
            <Route index              element={<Dashboard />} />
            <Route path="jobs"        element={<Jobs />} />
            <Route path="jobs/:id"    element={<JobDetail />} />
            <Route path="exams"       element={<Exams />} />
            <Route path="test/:id"    element={<MockTest />} />
            <Route path="ai"          element={<AiMentor />} />
            <Route path="profile"     element={<Profile />} />
            <Route path="applications" element={<Applications />} />
            <Route path="roadmap"     element={<Roadmap />} />

            {/* New feature routes */}
            <Route path="resume"      element={<ResumeAnalyzer />} />
            <Route path="interview"   element={<MockInterview />} />
            <Route path="scam-check"  element={<JobScamChecker />} />
            <Route path="compare"     element={<CareerComparison />} />
            <Route path="quiz"        element={<DailyQuiz />} />
            <Route path="salary"      element={<SalaryCalculator />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
