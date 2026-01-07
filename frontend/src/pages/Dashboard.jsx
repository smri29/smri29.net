import React, { useState } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import ResearchManager from '../components/dashboard/ResearchManager';
import ProjectManager from '../components/dashboard/ProjectManager';
import CertificateManager from '../components/dashboard/CertificateManager';
import SkillManager from '../components/dashboard/SkillManager';
import MessageInbox from '../components/dashboard/MessageInbox';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('research');

  return (
    <div className="min-h-screen bg-[#050505] flex text-white">
      {/* 1. Permanent Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. Dynamic Content Area */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto h-screen">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'research' && <ResearchManager />}
          {activeTab === 'projects' && <ProjectManager />}
          {activeTab === 'certificates' && <CertificateManager />}
          {activeTab === 'skills' && <SkillManager />}
          {activeTab === 'messages' && <MessageInbox />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;