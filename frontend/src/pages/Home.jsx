import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import ChatWidget from '../components/ChatWidget';
import API from '../api/axios';
import { ChevronDown, ChevronUp, ExternalLink, Github, Award, BookOpen } from 'lucide-react';

const Home = () => {
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  
  // State to track expanded items (Key: _id, Value: boolean)
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedResearch, setExpandedResearch] = useState({});

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

  // Helpers to toggle details
  const toggleProject = (id) => {
    setExpandedProjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleResearch = (id) => {
    setExpandedResearch(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderResearch = (items, type) => {
    const filtered = items.filter(item => item.type === type);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-neon-pink text-xs uppercase tracking-[0.2em] mb-6 font-bold border-l-2 border-neon-pink pl-4">
          {type}
        </h4>
        <div className="grid md:grid-cols-2 gap-8">
          {filtered.map((item) => {
            const isExpanded = !!expandedResearch[item._id];

            return (
              <div key={item._id} className="glass-card p-6 border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col justify-between group">
                <div>
                  <h5 className="text-xl font-bold text-white group-hover:text-neon-pink transition-colors">
                    {item.title}
                  </h5>
                  <p className="text-xs text-neon-pink mt-1 mb-3">{item.publicationName} • {new Date(item.publicationDate).getFullYear()}</p>
                  
                  {/* Abstract - Conditional Line Clamp */}
                  <p className={`text-gray-400 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {item.abstract}
                  </p>

                  {/* Expanded Content: Authors & details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 animate-in fade-in slide-in-from-top-2">
                       {item.authors && item.authors.length > 0 && (
                          <div className="text-xs">
                             <span className="text-neon-pink font-bold">Authors: </span>
                             <span className="text-gray-300">{item.authors.join(', ')}</span>
                          </div>
                       )}
                       <div className="text-xs">
                          <span className="text-neon-pink font-bold">Type: </span>
                          <span className="text-gray-300">{item.type}</span>
                       </div>
                    </div>
                  )}
                </div>

                {/* Footer: Links & Read More */}
                <div className="flex justify-between items-center mt-6 pt-2">
                  <div>
                    {item.doiLink && (
                      <a href={item.doiLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-white hover:text-neon-pink underline decoration-neon-pink">
                        <ExternalLink size={12} /> Read Publication
                      </a>
                    )}
                  </div>

                  <button 
                    onClick={() => toggleResearch(item._id)} 
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-neon-pink transition-colors font-medium"
                  >
                    {isExpanded ? 'Show Less' : 'Read More'}
                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                </div>
              </div>
            );
          })}
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
          {filtered.map((item) => {
            const isExpanded = !!expandedProjects[item._id]; // Check if this specific card is open

            return (
              <div key={item._id} className="glass-card p-6 border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col justify-between group">
                <div>
                  <h5 className="text-lg font-bold text-white group-hover:text-neon-pink transition-colors">
                    {item.projectName}
                  </h5>
                  
                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-2 my-3">
                      {item.techStack.slice(0, 3).map(tech => (
                          <span key={tech} className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-400 border border-white/5">{tech}</span>
                      ))}
                      {item.techStack.length > 3 && <span className="text-[10px] text-gray-500">+{item.techStack.length - 3}</span>}
                  </div>

                  {/* Description - Conditional Line Clamp */}
                  <p className={`text-gray-400 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                    {item.description}
                  </p>

                  {/* Expanded Content (Role & Contributors) */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-2 animate-in fade-in slide-in-from-top-2">
                       <div className="text-xs">
                          <span className="text-neon-pink font-bold">Role: </span> 
                          <span className="text-gray-300">{item.role || 'Developer'}</span>
                       </div>
                       {item.contributors && item.contributors.length > 0 && (
                          <div className="text-xs">
                             <span className="text-neon-pink font-bold">Team: </span>
                             <span className="text-gray-400">{item.contributors.join(', ')}</span>
                          </div>
                       )}
                    </div>
                  )}
                </div>

                {/* Footer: Links & Read More Toggle */}
                <div className="flex justify-between items-center mt-6 pt-2">
                  <div className="flex gap-4">
                    {item.liveLink && (
                      <a href={item.liveLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-neon-pink hover:underline">
                         <ExternalLink size={12}/> Live
                      </a>
                    )}
                    {item.githubLink && (
                      <a href={item.githubLink} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-white">
                         <Github size={12}/> Code
                      </a>
                    )}
                  </div>

                  <button 
                    onClick={() => toggleProject(item._id)} 
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-neon-pink transition-colors font-medium"
                  >
                    {isExpanded ? 'Show Less' : 'Read More'}
                    {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCerts = (items, category) => {
    const filtered = items.filter(item => item.category === category);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-gray-400 text-xs uppercase tracking-widest mb-4 font-bold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-pink"></span>
          {category}
        </h4>
        
        {/* Full Width Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div key={item._id} className="glass-card p-5 border border-white/5 hover:border-neon-pink/30 hover:bg-white/5 transition-all group relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-r from-neon-pink/0 to-neon-pink/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="relative z-10 flex justify-between items-start">
                   <div>
                      <h5 className="font-bold text-sm text-white leading-tight mb-1">{item.name}</h5>
                      <p className="text-xs text-gray-500">{item.issuingOrganization}</p>
                      <p className="text-[10px] text-gray-600 mt-2">{new Date(item.issueDate).toLocaleDateString()}</p>
                   </div>
                   
                   {item.verificationLink && (
                       <a href={item.verificationLink} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-neon-pink transition-colors">
                           <ExternalLink size={16}/>
                       </a>
                   )}
               </div>
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
            <div className="flex items-center gap-3 mb-12">
               <Award className="text-neon-pink" size={32} />
               <h2 className="text-3xl font-bold">Professional <span className="text-neon-pink">Certifications</span></h2>
            </div>
            
            {renderCerts(certificates, 'AI/ML')}
            {renderCerts(certificates, 'Kaggle')}
            {renderCerts(certificates, 'Research')}
            {renderCerts(certificates, 'Professional')}
            {renderCerts(certificates, 'Others')}
          </div>
        </section>

        <Contact />
      </main>

      <ChatWidget />

      <footer className="py-12 text-center border-t border-white/5 bg-black/80 text-gray-500 text-sm relative z-20">
        <p>© 2026 Shah Mohammad Rizvi. Built for Professional Outreach.</p>
      </footer>
    </div>
  );
};

export default Home;