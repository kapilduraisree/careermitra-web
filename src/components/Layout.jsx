import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  Home, Briefcase, BookOpen, Bot, User, Menu, X,
  LogOut, Moon, Sun, Target, FileText, Mic2,
  Shield, GitCompare, Zap, Calculator, ChevronDown
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import './Layout.css'

const mainNav = [
  { to: '/',            icon: Home,      label: 'Home' },
  { to: '/jobs',        icon: Briefcase, label: 'Jobs' },
  { to: '/exams',       icon: BookOpen,  label: 'Exams' },
  { to: '/ai',          icon: Bot,       label: 'AI Mentor' },
  { to: '/applications',icon: Target,    label: 'Tracker' },
  { to: '/profile',     icon: User,      label: 'Profile' },
]

const aiTools = [
  { to: '/resume',    icon: FileText,   label: 'Resume Analyzer' },
  { to: '/interview', icon: Mic2,       label: 'Mock Interview' },
  { to: '/compare',   icon: GitCompare, label: 'Career Compare' },
  { to: '/roadmap',   icon: Target,     label: 'Roadmap' },
]

const examTools = [
  { to: '/quiz',    icon: Zap,        label: 'Daily Quiz' },
  { to: '/scam-check', icon: Shield,  label: 'Scam Checker' },
  { to: '/salary',  icon: Calculator, label: 'Salary Calc' },
]

export default function Layout() {
  const [open, setOpen]       = useState(true)
  const [aiExpanded, setAi]   = useState(false)
  const [examExpanded, setEx] = useState(false)
  const navigate  = useNavigate()
  const { dark, toggle } = useTheme()
  const userName  = localStorage.getItem('userName') || 'User'

  const logout = () => { localStorage.clear(); navigate('/login') }

  return (
    <div className={`layout ${open ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-header">
          <span className="logo">🎯</span>
          {open && <span className="logo-text">CareerMitra AI</span>}
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {/* Main nav */}
          {mainNav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to==='/'} className={({ isActive }) => `nav-item ${isActive?'active':''}`}>
              <Icon size={18}/>
              {open && <span>{label}</span>}
            </NavLink>
          ))}

          {/* AI Tools group */}
          {open && (
            <>
              <button className="nav-group-btn" onClick={() => setAi(!aiExpanded)}>
                <span>🤖 AI Tools</span>
                <ChevronDown size={14} className={aiExpanded ? 'rotated' : ''}/>
              </button>
              {aiExpanded && aiTools.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-item nav-sub ${isActive?'active':''}`}>
                  <Icon size={16}/><span>{label}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Exam Tools group */}
          {open && (
            <>
              <button className="nav-group-btn" onClick={() => setEx(!examExpanded)}>
                <span>📚 More Tools</span>
                <ChevronDown size={14} className={examExpanded ? 'rotated' : ''}/>
              </button>
              {examExpanded && examTools.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} className={({ isActive }) => `nav-item nav-sub ${isActive?'active':''}`}>
                  <Icon size={16}/><span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Bottom actions */}
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={toggle} title="Toggle dark mode">
            {dark ? <Sun size={18}/> : <Moon size={18}/>}
            {open && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button className="nav-item logout-btn" onClick={logout}>
            <LogOut size={18}/>
            {open && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen(!open)}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div className="topbar-right">
            <span className="user-greeting">👋 {userName}</span>
            <button className="icon-btn" onClick={toggle} title="Toggle theme">
              {dark ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
