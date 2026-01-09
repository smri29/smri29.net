import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Code, Award, Cpu, Mail, LogOut, LayoutDashboard, Briefcase, Heart } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();

  const menuItems = [
    { id: 'research', label: 'Research', icon: <BookOpen size={20}/> },
    { id: 'projects', label: 'Projects', icon: <Code size={20}/> },
    { id: 'experience', label: 'Experience', icon: <Briefcase size={20}/> }, // NEW
    { id: 'certificates', label: 'Certificates', icon: <Award size={20}/> },
    { id: 'skills', label: 'Skills', icon: <Cpu size={20}/> },
    { id: 'hobbies', label: 'Interests', icon: <Heart size={20}/> }, // NEW
    { id: 'messages', label: 'Messages', icon: <Mail size={20}/> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-black border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b border-white/5">
        <h1 className="text-xl font-bold text-neon-pink flex items-center gap-2">
          <LayoutDashboard /> Admin
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id 
              ? 'bg-neon-pink text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]' 
              : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <button onClick={handleLogout} className="p-8 text-gray-500 hover:text-red-500 flex items-center gap-2 transition-colors">
        <LogOut size={20} /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;