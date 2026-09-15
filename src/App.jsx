import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import JobDetail from './pages/JobDetail'
import Exams from './pages/Exams'
import MockTest from './pages/MockTest'
import AiMentor from './pages/AiMentor'
import Profile from './pages/Profile'
import Applications from './pages/Applications'
import Roadmap from './pages/Roadmap'
import Layout from './components/Layout'

const isLoggedIn = () => !!localStorage.getItem('accessToken')

const Protected = ({ children }) =>
  isLoggedIn() ? children : <Navigate to="/login" replace />

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index            element={<Dashboard />} />
          <Route path="jobs"      element={<Jobs />} />
          <Route path="jobs/:id"  element={<JobDetail />} />
          <Route path="exams"     element={<Exams />} />
          <Route path="test/:id"  element={<MockTest />} />
          <Route path="ai"        element={<AiMentor />} />
          <Route path="profile"   element={<Profile />} />
          <Route path="applications" element={<Applications />} />
          <Route path="roadmap"   element={<Roadmap />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
