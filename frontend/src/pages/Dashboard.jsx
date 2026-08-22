import React, { useMemo, useState } from 'react';
import AnalyticsManager from '../components/dashboard/AnalyticsManager';
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

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const tabs = ['analytics', 'hero', 'introduction', 'ai', 'research', 'projects', 'experience', 'education', 'certificates', 'hobbies', 'messages'];

  const managerByTab = useMemo(
    () => ({
      analytics: <AnalyticsManager />,
      hero: <HeroManager />,
      introduction: <IntroductionManager />,
      ai: <AIKnowledgeManager />,
      research: <ResearchManager />,
      projects: <ProjectManager />,
      experience: <ExperienceManager />,
      education: <EducationManager />,
      certificates: <CertificateManager />,
      hobbies: <HobbyManager />,
      messages: <MessageInbox />,
    }),
    []
  );

  return (
    <div className="admin-theme flex h-screen overflow-hidden text-slate-100">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-5 lg:p-8">
        <div className="mx-auto w-full max-w-[1380px]">
          <div className="admin-surface mb-5 flex flex-wrap gap-2 rounded-3xl p-3 md:hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-full px-3 py-1.5 text-xs uppercase tracking-wide ${
                  activeTab === tab
                    ? 'admin-chip'
                    : 'border border-white/15 bg-slate-950/30 text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <h1 className="mb-7 font-serif text-3xl capitalize text-slate-100 md:text-4xl">
            Manage{' '}
            <span className="admin-heading-accent">
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
