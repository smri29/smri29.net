import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  Github,
  Heart,
  MapPin,
  Smile,
} from 'lucide-react';
import API from '../api/axios';
import About from '../components/About';
import ChatWidget from '../components/ChatWidget';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Skills from '../components/Skills';

const MotionSection = motion.section;

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const PROJECT_CATEGORIES = ['AI/ML', 'MERN', 'Flutter', 'Others'];
const CERT_CATEGORIES = ['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others'];

const Home = () => {
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [experience, setExperience] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedResearch, setExpandedResearch] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [researchRes, projectRes, certRes, expRes, hobbyRes] = await Promise.all([
          API.get('/data/research'),
          API.get('/data/projects'),
          API.get('/data/certificates'),
          API.get('/data/experience'),
          API.get('/data/hobbies'),
        ]);

        setResearch(Array.isArray(researchRes.data) ? researchRes.data : []);
        setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
        setCertificates(Array.isArray(certRes.data) ? certRes.data : []);
        setExperience(Array.isArray(expRes.data) ? expRes.data : []);
        setHobbies(Array.isArray(hobbyRes.data) ? hobbyRes.data : []);
      } catch (error) {
        console.error('Error fetching portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const researchByType = useMemo(() => {
    return research.reduce(
      (acc, item) => {
        if (item.type === 'Journal') acc.journals.push(item);
        if (item.type === 'Conference') acc.conferences.push(item);
        return acc;
      },
      { journals: [], conferences: [] }
    );
  }, [research]);

  const projectsByCategory = useMemo(() => {
    return projects.reduce((acc, item) => {
      const category = PROJECT_CATEGORIES.includes(item.category) ? item.category : 'Others';
      acc[category].push(item);
      return acc;
    }, Object.fromEntries(PROJECT_CATEGORIES.map((category) => [category, []])));
  }, [projects]);

  const certsByCategory = useMemo(() => {
    return certificates.reduce((acc, item) => {
      const category = CERT_CATEGORIES.includes(item.category) ? item.category : 'Others';
      acc[category].push(item);
      return acc;
    }, Object.fromEntries(CERT_CATEGORIES.map((category) => [category, []])));
  }, [certificates]);

  const toggleProject = (id) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleResearch = (id) => {
    setExpandedResearch((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.12]" />
      <div className="pointer-events-none fixed -left-24 -top-24 h-80 w-80 rounded-full bg-cyan-300/15 blur-[100px]" />
      <div className="pointer-events-none fixed -bottom-24 -right-16 h-72 w-72 rounded-full bg-amber-300/10 blur-[95px]" />

      <Navbar />

      <main className="relative z-10">
        <Hero />
        <About />

        <MotionSection
          id="experience"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="border-t border-white/5 bg-slate-950/25 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <Briefcase className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Work <span className="text-cyan-200">Experience</span>
              </h2>
            </div>

            {loading ? (
              <p className="text-sm text-slate-400">Loading experience...</p>
            ) : experience.length === 0 ? (
              <p className="text-sm text-slate-400">No experience items added yet.</p>
            ) : (
              <div className="grid gap-6">
                {experience.map((job) => (
                  <article
                    key={job._id}
                    className="glass-card border-white/10 p-6 transition hover:border-cyan-300/30 md:p-7"
                  >
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-100">{job.role}</h3>
                        <p className="text-sm text-cyan-200">{job.company}</p>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400 md:text-right">
                        <p className="inline-flex items-center gap-1 md:justify-end">
                          <Calendar size={12} /> {job.duration}
                        </p>
                        {job.location && (
                          <p className="inline-flex items-center gap-1 md:justify-end">
                            <MapPin size={12} /> {job.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{job.description}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </MotionSection>

        <MotionSection
          id="projects"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="border-t border-white/5 bg-slate-950/45 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <Code className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Technical <span className="text-cyan-200">Projects</span>
              </h2>
            </div>

            {PROJECT_CATEGORIES.map((category) => {
              const items = projectsByCategory[category] || [];
              if (!items.length) return null;

              return (
                <div key={category} className="mb-10">
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{category}</h3>
                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {items.map((item) => {
                      const isExpanded = Boolean(expandedProjects[item._id]);
                      const techStack = Array.isArray(item.techStack) ? item.techStack : [];

                      return (
                        <article
                          key={item._id}
                          className="glass-card flex flex-col justify-between border-white/10 p-5 transition hover:-translate-y-1 hover:border-cyan-300/30"
                        >
                          <div>
                            <h4 className="text-lg font-semibold text-slate-100">{item.projectName}</h4>
                            <div className="my-3 flex flex-wrap gap-2">
                              {techStack.slice(0, 4).map((tech, idx) => (
                                <span key={`${tech}-${idx}`} className="rounded-full border border-white/15 bg-slate-800/60 px-2 py-1 text-[10px] text-slate-200">
                                  {tech}
                                </span>
                              ))}
                              {techStack.length > 4 && <span className="text-[10px] text-slate-400">+{techStack.length - 4}</span>}
                            </div>
                            <p className={`text-sm leading-relaxed text-slate-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {item.description}
                            </p>

                            {isExpanded && (
                              <div className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-300">
                                <p>
                                  <span className="font-semibold text-cyan-200">Role:</span> {item.role || 'Developer'}
                                </p>
                                {item.contributors?.length > 0 && (
                                  <p className="mt-1">
                                    <span className="font-semibold text-cyan-200">Team:</span> {item.contributors.join(', ')}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="mt-6 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-3">
                              {item.liveLink && (
                                <a
                                  href={item.liveLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-cyan-200 transition hover:text-cyan-100"
                                >
                                  <ExternalLink size={12} /> Live
                                </a>
                              )}
                              {item.githubLink && (
                                <a
                                  href={item.githubLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-slate-300 transition hover:text-cyan-200"
                                >
                                  <Github size={12} /> Code
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => toggleProject(item._id)}
                              type="button"
                              className="inline-flex items-center gap-1 text-slate-400 transition hover:text-cyan-200"
                            >
                              {isExpanded ? 'Less' : 'More'}
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </MotionSection>

        <MotionSection
          id="research"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="border-t border-white/5 bg-slate-950/25 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <BookOpen className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Research <span className="text-cyan-200">Publications</span>
              </h2>
            </div>

            {[
              { label: 'Journal', items: researchByType.journals },
              { label: 'Conference', items: researchByType.conferences },
            ].map(({ label, items }) => {
              if (!items.length) return null;

              return (
                <div key={label} className="mb-10">
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{label}</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    {items.map((item) => {
                      const isExpanded = Boolean(expandedResearch[item._id]);
                      return (
                        <article
                          key={item._id}
                          className="glass-card flex flex-col justify-between border-white/10 p-6 transition hover:border-cyan-300/30"
                        >
                          <div>
                            <h4 className="text-xl font-semibold text-slate-100">{item.title}</h4>
                            <p className="mt-1 text-xs text-cyan-200">
                              {item.publicationName} • {new Date(item.publicationDate).getFullYear()}
                            </p>
                            <p className={`mt-3 text-sm leading-relaxed text-slate-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                              {item.abstract}
                            </p>

                            {isExpanded && item.authors?.length > 0 && (
                              <p className="mt-4 border-t border-white/10 pt-4 text-xs text-slate-300">
                                <span className="font-semibold text-cyan-200">Authors:</span> {item.authors.join(', ')}
                              </p>
                            )}
                          </div>

                          <div className="mt-5 flex items-center justify-between text-xs">
                            {item.doiLink ? (
                              <a
                                href={item.doiLink}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-cyan-200 transition hover:text-cyan-100"
                              >
                                <ExternalLink size={12} /> Read Publication
                              </a>
                            ) : (
                              <span className="text-slate-500">No publication link</span>
                            )}
                            <button
                              onClick={() => toggleResearch(item._id)}
                              type="button"
                              className="inline-flex items-center gap-1 text-slate-400 transition hover:text-cyan-200"
                            >
                              {isExpanded ? 'Less' : 'More'}
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </MotionSection>

        <Skills />

        <MotionSection
          id="certifications"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="border-t border-white/5 bg-slate-950/45 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <Award className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Professional <span className="text-cyan-200">Certifications</span>
              </h2>
            </div>

            {CERT_CATEGORIES.map((category) => {
              const items = certsByCategory[category] || [];
              if (!items.length) return null;

              return (
                <div key={category} className="mb-10">
                  <h3 className="mb-5 text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{category}</h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item) => (
                      <article
                        key={item._id}
                        className="glass-card border-white/10 p-5 transition hover:-translate-y-1 hover:border-cyan-300/35"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">{item.name}</h4>
                            <p className="mt-1 text-xs text-slate-400">{item.issuingOrganization}</p>
                            <p className="mt-2 text-[11px] text-slate-500">{new Date(item.issueDate).toLocaleDateString()}</p>
                          </div>
                          {item.verificationLink && (
                            <a
                              href={item.verificationLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 transition hover:text-cyan-200"
                              aria-label="Verify certificate"
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </MotionSection>

        <MotionSection
          id="hobbies"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="border-t border-white/5 bg-slate-950/25 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex items-center gap-3">
              <Heart className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Interests and <span className="text-cyan-200">Hobbies</span>
              </h2>
            </div>

            {hobbies.length === 0 ? (
              <p className="text-sm text-slate-400">No hobbies added yet.</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {hobbies.map((hobby) => (
                  <article
                    key={hobby._id}
                    className="glass-card border-white/10 p-5 text-center transition hover:-translate-y-1 hover:border-cyan-300/30"
                  >
                    <div className="mb-3 text-3xl text-cyan-200">{hobby.icon || <Smile size={26} className="mx-auto" />}</div>
                    <h4 className="font-semibold text-slate-100">{hobby.name}</h4>
                    {hobby.description && <p className="mt-2 text-xs text-slate-400">{hobby.description}</p>}
                  </article>
                ))}
              </div>
            )}
          </div>
        </MotionSection>

        <Contact />
      </main>

      <ChatWidget />

      <footer className="relative z-20 border-t border-white/10 bg-slate-950/85 px-6 py-10 text-center text-sm text-slate-500">
        <p>© 2026 Shah Mohammad Rizvi. Built for professional outreach.</p>
      </footer>
    </div>
  );
};

export default Home;
