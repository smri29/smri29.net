import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import ChatWidget from '../components/ChatWidget'; // <--- Imported ChatWidget
import API from '../api/axios';

const Home = () => {
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [researchRes, projectRes, certRes] = await Promise.all([
          API.get('/data/research'),
          API.get('/data/projects'),
          API.get('/data/certificates')
        ]);
        setResearch(researchRes.data);
        setProjects(projectRes.data);
        setCertificates(certRes.data);
      } catch (err) {
        console.error("Error fetching portfolio data:", err);
      }
    };
    fetchData();
  }, []);

  const renderResearch = (items, type) => {
    const filtered = items.filter(item => item.type === type);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-neon-pink text-xs uppercase tracking-[0.2em] mb-6 font-bold border-l-2 border-neon-pink pl-4">
          {type}
        </h4>
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((item) => (
            <div key={item._id} className="glass-card p-6 border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col justify-between group">
              <div>
                <h5 className="text-xl font-bold text-white group-hover:text-neon-pink transition-colors">
                  {item.title}
                </h5>
                <p className="text-xs text-neon-pink mt-1 mb-3">{item.publicationName} • {new Date(item.publicationDate).getFullYear()}</p>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                  {item.abstract}
                </p>
              </div>
              <div className="mt-6">
                {item.doiLink && (
                  <a href={item.doiLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-neon-pink underline decoration-neon-pink">
                    Read Publication
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = (items, category) => {
    const filtered = items.filter(item => item.category === category);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-neon-pink text-xs uppercase tracking-[0.2em] mb-6 font-bold border-l-2 border-neon-pink pl-4">
          {category}
        </h4>
        <div className="grid md:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div key={item._id} className="glass-card p-6 border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col justify-between group">
              <div>
                <h5 className="text-lg font-bold text-white group-hover:text-neon-pink transition-colors">
                  {item.projectName}
                </h5>
                <div className="flex flex-wrap gap-2 my-3">
                    {item.techStack.slice(0, 3).map(tech => (
                        <span key={tech} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">{tech}</span>
                    ))}
                </div>
                <p className="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                {item.liveLink && (
                  <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-neon-pink hover:underline">Live Demo</a>
                )}
                {item.githubLink && (
                  <a href={item.githubLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-500 hover:text-white">GitHub</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderCerts = (items, category) => {
    const filtered = items.filter(item => item.category === category);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-8">
        <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold">
          {category}
        </h4>
        <div className="grid gap-4">
          {filtered.map((item) => (
            <div key={item._id} className="glass-card p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
               <div>
                  <h5 className="font-bold text-sm text-white">{item.name}</h5>
                  <p className="text-xs text-gray-500">{item.issuingOrganization}</p>
               </div>
               {item.verificationLink && (
                   <a href={item.verificationLink} target="_blank" rel="noreferrer" className="text-[10px] border border-neon-pink/50 text-neon-pink px-3 py-1 rounded-full hover:bg-neon-pink hover:text-white transition-all">Verify</a>
               )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-dark-bg min-h-screen selection:bg-neon-pink selection:text-white overflow-x-hidden text-white relative">
      
      {/* GLOBAL BACKGROUND GRID */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none -z-0"></div>

      <Navbar />

      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full animate-pulse-slow -z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-0"></div>

      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />

        {/* PUBLICATIONS SECTION */}
        <section id="research" className="py-24 px-6 border-t border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Research <span className="text-neon-pink">Publications</span></h2>
            {renderResearch(research, 'Journal')}
            {renderResearch(research, 'Conference')}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="py-24 px-6 border-t border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Technical <span className="text-neon-pink">Projects</span></h2>
            {renderProjects(projects, 'AI/ML')}
            {renderProjects(projects, 'MERN')}
            {renderProjects(projects, 'Flutter')}
            {renderProjects(projects, 'Others')}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certifications" className="py-24 px-6 border-t border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Professional <span className="text-neon-pink">Certifications</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                {renderCerts(certificates, 'AI/ML')}
                {renderCerts(certificates, 'Kaggle')}
              </div>
              <div className="space-y-6">
                {renderCerts(certificates, 'Research')}
                {renderCerts(certificates, 'Professional')}
              </div>
            </div>
          </div>
        </section>

        <Contact />
      </main>

      {/* RIZVI AI CHATBOT - Added Here */}
      <ChatWidget />

      <footer className="py-12 text-center border-t border-white/5 bg-black/80 text-gray-500 text-sm relative z-20">
        <p>© 2026 Shah Mohammad Rizvi. Built for Professional Outreach.</p>
      </footer>
    </div>
  );
};

export default Home;