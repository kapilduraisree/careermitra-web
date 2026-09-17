import React, { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, Briefcase, BookOpen, Bot, User, Menu, X,
  LogOut, Moon, Sun, Target, FileText, Mic2,
  Shield, GitCompare, Zap, Calculator, ChevronDown
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import './Layout.css'

const mainNav = [
  { to: '/',             icon: Home,      label: 'Home' },
  { to: '/jobs',         icon: Briefcase, label: 'Jobs' },
  { to: '/exams',        icon: BookOpen,  label: 'Exams' },
  { to: '/ai',           icon: Bot,       label: 'AI Mentor' },
  { to: '/applications', icon: Target,    label: 'Tracker' },
  { to: '/profile',      icon: User,      label: 'Profile' },
]

const aiTools = [
  { to: '/resume',    icon: FileText,   label: 'Resume Analyzer' },
  { to: '/interview', icon: Mic2,       label: 'Mock Interview' },
  { to: '/compare',   icon: GitCompare, label: 'Career Compare' },
  { to: '/roadmap',   icon: Target,     label: 'Roadmap' },
]

const moreTools = [
  { to: '/quiz',       icon: Zap,        label: 'Daily Quiz' },
  { to: '/scam-check', icon: Shield,     label: 'Scam Checker' },
  { to: '/salary',     icon: Calculator, label: 'Salary Calc' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [aiExpanded, setAi]           = useState(false)
  const [moreExpanded, setMore]       = useState(false)
  const [isMobile, setIsMobile]       = useState(window.innerWidth < 768)
  const navigate  = useNavigate()
  const location  = useLocation()
  const { dark, toggle } = useTheme()
  const overlayRef = useRef()
  const userName = localStorage.getItem('userName') || 'User'

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // On desktop default open, on mobile default closed
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname])

  const logout = () => { localStorage.clear(); navigate('/login') }

  const NavItem = ({ to, icon: Icon, label, sub = false }) => (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${sub ? 'nav-sub' : ''}`}
      onClick={() => isMobile && setSidebarOpen(false)}
    >
      <Icon size={sub ? 16 : 18} />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>

      {/* Mobile overlay — tap to close */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isMobile ? 'mobile-sidebar' : ''} ${sidebarOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <span className="logo">🎯</span>
          <span className="logo-text">CareerMitra AI</span>
          {isMobile && (
            <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {mainNav.map(item => <NavItem key={item.to} {...item} />)}

          {/* AI Tools */}
          <button className="nav-group-btn" onClick={() => setAi(!aiExpanded)}>
            <span>🤖 AI Tools</span>
            <ChevronDown size={13} style={{ transform: aiExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {aiExpanded && aiTools.map(item => <NavItem key={item.to} {...item} sub />)}

          {/* More Tools */}
          <button className="nav-group-btn" onClick={() => setMore(!moreExpanded)}>
            <span>📚 More Tools</span>
            <ChevronDown size={13} style={{ transform: moreExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>
          {moreExpanded && moreTools.map(item => <NavItem key={item.to} {...item} sub />)}
        </nav>

        {/* Bottom */}
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={toggle}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={22} />
          </button>
          <div className="topbar-center">
            {isMobile && (
              <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--primary)' }}>
                🎯 CareerMitra AI
              </span>
            )}
          </div>
          <div className="topbar-right">
            {!isMobile && (
              <span className="user-greeting">👋 {userName.split(' ')[0]}</span>
            )}
            <button className="icon-btn" onClick={toggle}>
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
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
