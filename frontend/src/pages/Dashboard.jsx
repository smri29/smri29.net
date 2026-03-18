import React, { useMemo, useState } from 'react';
import AIKnowledgeManager from '../components/dashboard/AIKnowledgeManager';
import CertificateManager from '../components/dashboard/CertificateManager';
import EducationManager from '../components/dashboard/EducationManager';
import ExperienceManager from '../components/dashboard/ExperienceManager';
import HeroManager from '../components/dashboard/HeroManager';
import HobbyManager from '../components/dashboard/HobbyManager';
import IntroductionManager from '../components/dashboard/IntroductionManager';
import MessageInbox from '../components/dashboard/MessageInbox';
import ProjectManager from '../components/dashboard/ProjectManager';
import ResearchManager from '../components/dashboard/ResearchManager';
import Sidebar from '../components/dashboard/Sidebar';
import SkillManager from '../components/dashboard/SkillManager';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('research');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const tabs = ['hero', 'introduction', 'ai', 'research', 'projects', 'experience', 'education', 'certificates', 'skills', 'hobbies', 'messages'];

  const managerByTab = useMemo(
    () => ({
      hero: <HeroManager />,
      introduction: <IntroductionManager />,
      ai: <AIKnowledgeManager />,
      research: <ResearchManager />,
      projects: <ProjectManager />,
      experience: <ExperienceManager />,
      education: <EducationManager />,
      certificates: <CertificateManager />,
      skills: <SkillManager />,
      hobbies: <HobbyManager />,
      messages: <MessageInbox />,
    }),
    []
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0d1625] text-slate-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8">
        <div className="mx-auto w-full max-w-[1380px]">
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
