import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Home, Briefcase, BookOpen, Bot, User, Menu, X, LogOut, Bell, Target } from 'lucide-react'
import './Layout.css'

const navItems = [
  { to: '/',            icon: Home,     label: 'Home' },
  { to: '/jobs',        icon: Briefcase,label: 'Jobs' },
  { to: '/exams',       icon: BookOpen, label: 'Learn' },
  { to: '/ai',          icon: Bot,      label: 'AI Mentor' },
  { to: '/applications',icon: Target,   label: 'Tracker' },
  { to: '/profile',     icon: User,     label: 'Profile' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()
  const userName = localStorage.getItem('userName') || 'User'

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo">🎯</span>
          {sidebarOpen && <span className="logo-text">CareerMitra AI</span>}
        </div>

        <nav className="sidebar-nav">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <button className="nav-item logout-btn" onClick={logout}>
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      {/* Main content */}
      <div className="main">
        {/* Top bar */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="topbar-right">
            <span className="user-greeting">👋 {userName}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
