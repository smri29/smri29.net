import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, ExternalLink, Github } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api/axios';
import { trackAnalyticsEvent } from '../analytics/tracker';
import InteractiveNetworkBackground from '../components/InteractiveNetworkBackground';

const MotionSection = motion.section;
const MotionArticle = motion.article;

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
      staggerChildren: 0.06,
    },
  },
};

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await API.get('/data/projects');
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <InteractiveNetworkBackground />
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.12]" />
      <div className="pointer-events-none fixed -left-20 top-0 h-96 w-96 rounded-full bg-cyan-300/12 blur-[110px]" />
      <div className="pointer-events-none fixed right-0 top-40 h-80 w-80 rounded-full bg-amber-200/10 blur-[105px]" />

      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/72 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <h1 className="font-serif text-3xl text-slate-100 md:text-4xl">
              <span className="text-cyan-200">Projects</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RouterLink
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/70 px-4 py-2 text-sm text-slate-200 transition hover:border-cyan-300/35 hover:text-cyan-200"
            >
              <ArrowLeft size={15} />
              Back to Home
            </RouterLink>
          </div>
        </div>
      </header>

      <main className="relative z-10 px-6 py-16 md:px-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <p className="text-sm text-slate-400">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-sm text-slate-400">No projects added yet.</p>
          ) : (
            <MotionSection
              variants={SECTION_VARIANTS}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <Code className="text-cyan-300" size={24} />
                <h2 className="text-2xl font-semibold text-slate-100 md:text-3xl">All Projects</h2>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {projects.map((item) => {
                  const techStack = Array.isArray(item.techStack) ? item.techStack.filter(Boolean) : [];

                  return (
                    <MotionArticle
                      key={item._id}
                      variants={CARD_VARIANTS}
                      className="glass-card card-sheen group overflow-hidden border-white/10 p-4 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
                    >
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/70">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.projectName}
                            className="aspect-[16/9.5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="flex aspect-[16/9.5] w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800/90 to-cyan-300/10 text-slate-500">
                            <div className="flex flex-col items-center gap-2">
                              <Code size={24} className="text-cyan-200/70" />
                              <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                                Project Preview
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-slate-100">{item.projectName}</h3>
                          {item.role && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-100/90">{item.role}</p>}
                        </div>

                        <div className="flex items-center gap-2">
                          {item.liveLink && (
                            <a
                              href={item.liveLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => trackAnalyticsEvent('click', 'project_live_click', {
                                projectName: item.projectName,
                                page: 'projects',
                              })}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100"
                              aria-label={`Open ${item.projectName} live project`}
                            >
                              <ExternalLink size={15} />
                            </a>
                          )}
                          {item.githubLink && (
                            <a
                              href={item.githubLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={() => trackAnalyticsEvent('click', 'project_github_click', {
                                projectName: item.projectName,
                                page: 'projects',
                              })}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100"
                              aria-label={`Open ${item.projectName} source code`}
                            >
                              <Github size={15} />
                            </a>
                          )}
                        </div>
                      </div>

                      {techStack.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {techStack.map((tech, index) => (
                            <span
                              key={`${item._id}-${tech}-${index}`}
                              className="rounded-full border border-white/12 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-200"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.description && (
                        <p className="mt-4 text-sm leading-relaxed text-slate-300">{item.description}</p>
                      )}
                    </MotionArticle>
                  );
                })}
              </div>
            </MotionSection>
          )}
        </div>
      </main>
    </div>
  );
};

export default Projects;
