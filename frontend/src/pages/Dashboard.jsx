import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ResearchManager from '../components/dashboard/ResearchManager';
import ProjectManager from '../components/dashboard/ProjectManager';
import CertificateManager from '../components/dashboard/CertificateManager';
import SkillManager from '../components/dashboard/SkillManager';
import MessageInbox from '../components/dashboard/MessageInbox';
import ExperienceManager from '../components/dashboard/ExperienceManager';
import HobbyManager from '../components/dashboard/HobbyManager'; 

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('research');

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans">
      {/* 1. Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen relative">
        <div className="max-w-6xl mx-auto">
           {/* Dynamic Title */}
           <h1 className="text-3xl font-bold mb-8 capitalize bg-gradient-to-r from-neon-pink to-purple-500 bg-clip-text text-transparent">
            Manage {activeTab === 'hobbies' ? 'Interests & Hobbies' : activeTab}
          </h1>

          {/* 3. Render the SPECIFIC Managers */}
          {activeTab === 'research' && <ResearchManager />}
          {activeTab === 'projects' && <ProjectManager />}
          {activeTab === 'experience' && <ExperienceManager />}
          {activeTab === 'certificates' && <CertificateManager />}
          {activeTab === 'skills' && <SkillManager />}
          {activeTab === 'hobbies' && <HobbyManager />}   
          {activeTab === 'messages' && <MessageInbox />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;