import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Contact from '../components/Contact';
import API from '../api/axios';

const Home = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await API.get('/data/projects');
        setData(data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const renderGroup = (items, subCat) => {
    const filtered = items.filter(item => item.subCategory === subCat);
    if (filtered.length === 0) return null;

    return (
      <div className="mb-12">
        <h4 className="text-neon-pink text-xs uppercase tracking-[0.2em] mb-6 font-bold border-l-2 border-neon-pink pl-4">
          {subCat}
        </h4>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div key={item._id} className="glass-card p-6 border border-white/5 hover:border-neon-pink/30 transition-all flex flex-col justify-between group">
              <div>
                <h5 className="text-xl font-bold text-white group-hover:text-neon-pink transition-colors">
                  {item.title}
                </h5>
                <p className="text-gray-400 text-sm mt-3 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <div className="flex gap-4 mt-6">
                {item.liveLink && (
                  <a href={item.liveLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-neon-pink hover:underline">
                    {item.category === 'Research Paper' ? 'Read Paper' : 'Live Demo'}
                  </a>
                )}
                {item.repoLink && (
                  <a href={item.repoLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-gray-500 hover:text-white">GitHub</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const publications = data.filter(i => i.category === 'Research Paper');
  const projects = data.filter(i => i.category === 'Development');
  const certifications = data.filter(i => i.category === 'Certification');

  return (
    <div className="bg-dark-bg min-h-screen selection:bg-neon-pink selection:text-white overflow-x-hidden text-white">
      <Navbar />

      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full animate-pulse-slow -z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-0"></div>

      <main className="relative z-10">
        <Hero />
        <About />
        <Skills />

        {/* PUBLICATIONS SECTION */}
        <section id="research" className="py-24 px-6 border-t border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Research <span className="text-neon-pink">Publications</span></h2>
            {renderGroup(publications, 'Conference')}
            {renderGroup(publications, 'Journal')}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section id="projects" className="py-24 px-6 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Technical <span className="text-neon-pink">Projects</span></h2>
            {renderGroup(projects, 'AI/ML')}
            {renderGroup(projects, 'MERN')}
          </div>
        </section>

        {/* CERTIFICATIONS SECTION */}
        <section id="certifications" className="py-24 px-6 border-t border-white/5 bg-black/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12">Professional <span className="text-neon-pink">Certifications</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                {renderGroup(certifications, 'AI/ML')}
                {renderGroup(certifications, 'Kaggle')}
              </div>
              <div className="space-y-4">
                {renderGroup(certifications, 'Research')}
                {renderGroup(certifications, 'Others')}
              </div>
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <footer className="py-12 text-center border-t border-white/5 bg-black/40 text-gray-500 text-sm">
        <p>© 2026 Shah Mohammad Rizvi. Built for Professional Outreach.</p>
      </footer>
    </div>
  );
};

export default Home;