import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Bot,
  BookOpen,
  BookOpenText,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Code,
  Cpu,
  GraduationCap,
  Heart,
  LayoutDashboard,
  LogOut,
  Mail,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, isCollapsed, setIsCollapsed }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'hero', label: 'Hero', icon: <Sparkles size={18} /> },
    { id: 'introduction', label: 'Introduction', icon: <BookOpenText size={18} /> },
    { id: 'ai', label: 'AI Knowledge', icon: <Bot size={18} /> },
    { id: 'research', label: 'Research', icon: <BookOpen size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Code size={18} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
    { id: 'education', label: 'Education', icon: <GraduationCap size={18} /> },
    { id: 'certificates', label: 'Certificates', icon: <Award size={18} /> },
    { id: 'skills', label: 'Skills', icon: <Cpu size={18} /> },
    { id: 'hobbies', label: 'Interests', icon: <Heart size={18} /> },
    { id: 'messages', label: 'Messages', icon: <Mail size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside
      className={`hidden h-full min-h-0 flex-col overflow-hidden border-r border-white/10 bg-slate-900/80 transition-all duration-300 md:flex ${
        isCollapsed ? 'w-24' : 'w-72'
      }`}
    >
      <div className={`border-b border-white/10 ${isCollapsed ? 'px-3 py-5' : 'px-6 py-6'}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between gap-3'}`}>
          <h2
            className={`inline-flex items-center font-serif text-cyan-200 ${
              isCollapsed ? 'justify-center' : 'gap-2 text-xl'
            }`}
          >
            <LayoutDashboard size={20} />
            {!isCollapsed && <span>Admin Panel</span>}
          </h2>
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 transition hover:border-cyan-300/40 hover:text-cyan-100"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            title={item.label}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeTab === item.id
                ? 'border border-cyan-300/45 bg-cyan-300/15 text-cyan-100'
                : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-slate-800/70 hover:text-slate-100'
            } ${isCollapsed ? 'justify-center px-3' : ''}`}
          >
            {item.icon}
            {!isCollapsed && item.label}
          </button>
        ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          title="Logout"
          className={`inline-flex w-full items-center justify-center rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-red-400/45 hover:text-red-300 ${
            isCollapsed ? 'gap-0 px-3' : 'gap-2'
          }`}
        >
          <LogOut size={16} />
          {!isCollapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
