import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, BookOpen, Briefcase, Code, Cpu, Heart, LayoutDashboard, LogOut, Mail } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'research', label: 'Research', icon: <BookOpen size={18} /> },
    { id: 'projects', label: 'Projects', icon: <Code size={18} /> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={18} /> },
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
    <aside className="sticky top-0 hidden h-screen w-72 flex-col border-r border-white/10 bg-slate-950/90 md:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <h2 className="inline-flex items-center gap-2 font-serif text-xl text-cyan-200">
          <LayoutDashboard size={20} /> Admin Panel
        </h2>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm transition ${
              activeTab === item.id
                ? 'border border-cyan-300/45 bg-cyan-300/15 text-cyan-100'
                : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-slate-800/70 hover:text-slate-100'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          onClick={handleLogout}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm text-slate-300 transition hover:border-red-400/45 hover:text-red-300"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
