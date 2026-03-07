import React, { useMemo, useState } from 'react';
import CertificateManager from '../components/dashboard/CertificateManager';
import ExperienceManager from '../components/dashboard/ExperienceManager';
import HobbyManager from '../components/dashboard/HobbyManager';
import MessageInbox from '../components/dashboard/MessageInbox';
import ProjectManager from '../components/dashboard/ProjectManager';
import ResearchManager from '../components/dashboard/ResearchManager';
import Sidebar from '../components/dashboard/Sidebar';
import SkillManager from '../components/dashboard/SkillManager';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('research');
  const tabs = ['research', 'projects', 'experience', 'certificates', 'skills', 'hobbies', 'messages'];

  const managerByTab = useMemo(
    () => ({
      research: <ResearchManager />,
      projects: <ProjectManager />,
      experience: <ExperienceManager />,
      certificates: <CertificateManager />,
      skills: <SkillManager />,
      hobbies: <HobbyManager />,
      messages: <MessageInbox />,
    }),
    []
  );

  return (
    <div className="flex min-h-screen bg-[#050913] text-slate-100">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="h-screen flex-1 overflow-y-auto p-6 md:p-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap gap-2 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-wide ${
                  activeTab === tab
                    ? 'bg-cyan-300 text-slate-950'
                    : 'border border-white/15 text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h1 className="mb-7 font-serif text-3xl capitalize text-slate-100 md:text-4xl">
            Manage{' '}
            <span className="bg-gradient-to-r from-cyan-200 to-amber-200 bg-clip-text text-transparent">
              {activeTab === 'hobbies' ? 'Interests and Hobbies' : activeTab}
            </span>
          </h1>

          {managerByTab[activeTab]}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
