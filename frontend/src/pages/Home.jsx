import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  BookOpen,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronUp,
  Code,
  ExternalLink,
  GraduationCap,
  Github,
  Heart,
  MapPin,
  Smile,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import API from '../api/axios';
import About from '../components/About';
import ChatWidget from '../components/ChatWidget';
import Contact from '../components/Contact';
import Hero from '../components/Hero';
import Navbar from '../components/Navbar';
import Skills from '../components/Skills';

const MotionSection = motion.section;
const MotionDiv = motion.div;
const MotionArticle = motion.article;

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const HEADER_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const PROJECT_CATEGORIES = ['AI/ML', 'MERN', 'Flutter', 'Others'];
const CERT_CATEGORIES = ['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others'];
const CERTIFICATE_PREVIEW_LIMIT = 3;

const CARD_STAGGER = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
      staggerChildren: 0.05,
    },
  },
};

const CARD_ITEM = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const formatMonthLabel = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const getExperienceRange = (job) => {
  const startLabel = formatMonthLabel(job.startDate);
  const endLabel = job.currentlyWorking ? 'Present' : formatMonthLabel(job.endDate);

  if (startLabel) {
    return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
  }

  return job.duration || 'Dates not provided';
};

const getCategoryAnchor = (category) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const formatCertificateDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const formatPublicationDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
};

const Home = () => {
  const [research, setResearch] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeProjectCategory, setActiveProjectCategory] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [researchRes, projectRes, certRes, expRes, educationRes, hobbyRes] = await Promise.all([
          API.get('/data/research'),
          API.get('/data/projects'),
          API.get('/data/certificates'),
          API.get('/data/experience'),
          API.get('/data/education'),
          API.get('/data/hobbies'),
        ]);

        setResearch(Array.isArray(researchRes.data) ? researchRes.data : []);
        setProjects(Array.isArray(projectRes.data) ? projectRes.data : []);
        setCertificates(Array.isArray(certRes.data) ? certRes.data : []);
        setExperience(Array.isArray(expRes.data) ? expRes.data : []);
        setEducation(Array.isArray(educationRes.data) ? educationRes.data : []);
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

  const availableProjectCategories = useMemo(
    () => PROJECT_CATEGORIES.filter((category) => (projectsByCategory[category] || []).length > 0),
    [projectsByCategory]
  );

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

  useEffect(() => {
    if (!availableProjectCategories.length) {
      setActiveProjectCategory(null);
      return;
    }

    setActiveProjectCategory((current) =>
      availableProjectCategories.includes(current) ? current : availableProjectCategories[0]
    );
  }, [availableProjectCategories]);

  const activeProjects = activeProjectCategory ? projectsByCategory[activeProjectCategory] || [] : [];

  return (
    <div className="relative min-h-screen overflow-x-hidden text-slate-100">
      <div className="pointer-events-none fixed inset-0 subtle-grid opacity-[0.1]" />
      <div className="pointer-events-none fixed inset-x-0 top-0 h-28 bg-gradient-to-b from-cyan-300/10 to-transparent" />
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
          className="section-shell zone-olive border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <Briefcase className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Work <span className="text-cyan-200">Experience</span>
              </h2>
            </MotionDiv>

            {loading ? (
              <p className="text-sm text-slate-400">Loading experience...</p>
            ) : experience.length === 0 ? (
              <p className="text-sm text-slate-400">No experience items added yet.</p>
            ) : (
              <div className="relative grid gap-5 before:absolute before:bottom-3 before:left-5 before:top-3 before:hidden before:w-px before:bg-gradient-to-b before:from-cyan-300/0 before:via-cyan-300/30 before:to-cyan-300/0 md:before:block">
                {experience.map((job) => (
                  <article
                    key={job._id}
                    className="glass-card card-sheen relative border-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 md:ml-10 md:p-6"
                  >
                    <span className="absolute -left-[2.7rem] top-8 hidden h-3 w-3 rounded-full border border-cyan-200/40 bg-cyan-300/80 shadow-[0_0_0_6px_rgba(8,15,28,0.88)] md:block" />
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-100 md:text-xl">{job.jobTitle || job.role}</h3>
                          {job.currentlyWorking && (
                            <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                              Present
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-cyan-200">{job.companyName || job.company}</p>
                      </div>
                      <div className="space-y-1 text-xs text-slate-400 md:text-right">
                        <p className="inline-flex items-center gap-1 md:justify-end">
                          <Calendar size={12} /> {getExperienceRange(job)}
                        </p>
                        {job.location && (
                          <p className="inline-flex items-center gap-1 md:justify-end">
                            <MapPin size={12} /> {job.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {job.description && (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">{job.description}</p>
                    )}
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
          className="section-shell zone-blue border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <Code className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Technical <span className="text-cyan-200">Projects</span>
              </h2>
            </MotionDiv>

            {loading ? (
              <p className="text-sm text-slate-400">Loading projects...</p>
            ) : availableProjectCategories.length > 0 ? (
              <>
                <div className="mb-6 flex flex-wrap gap-3">
                  {availableProjectCategories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveProjectCategory(category)}
                      className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition ${
                        activeProjectCategory === category
                          ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100'
                          : 'border-white/10 bg-slate-800/70 text-slate-300 hover:border-cyan-300/35 hover:text-cyan-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeProjectCategory && (
                    <MotionDiv
                      key={activeProjectCategory}
                      variants={CARD_STAGGER}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeOut' } }}
                    >
                      <div className="mb-5 flex items-center gap-3">
                        <span className="section-kicker">Selected Category</span>
                        <h3 className="text-xl font-semibold text-slate-100 md:text-[1.7rem]">
                          {activeProjectCategory}
                        </h3>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {activeProjects.map((item) => {
                          const isExpanded = Boolean(expandedProjects[item._id]);
                          const techStack = Array.isArray(item.techStack) ? item.techStack : [];
                          const visibleTechStack = isExpanded ? techStack : techStack.slice(0, 4);
                          const hasMoreTech = techStack.length > visibleTechStack.length;
                          const hasContributors = Array.isArray(item.contributors) && item.contributors.length > 0;
                          const canExpand =
                            hasContributors || Boolean(item.role) || techStack.length > 5 || (item.description || '').length > 180;

                          return (
                            <MotionArticle
                              key={item._id}
                              variants={CARD_ITEM}
                              className="glass-card card-sheen group relative overflow-hidden rounded-[24px] border-white/10 bg-slate-900/58 p-3.5 shadow-[0_16px_42px_rgba(6,10,22,0.18)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900/78 md:p-4"
                            >
                              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-cyan-300/10 via-transparent to-amber-200/5 opacity-70 transition duration-300 group-hover:opacity-100" />

                              <div className="relative z-10 flex h-full flex-col">
                                <div className="mb-3 overflow-hidden rounded-[16px] border border-white/10 bg-slate-900/70">
                                  {item.imageUrl ? (
                                    <img
                                      src={item.imageUrl}
                                      alt={item.projectName}
                                      className="aspect-[16/9.5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                    />
                                  ) : (
                                    <div className="flex aspect-[16/8.5] w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800/90 to-cyan-300/10 text-slate-500">
                                      <div className="flex flex-col items-center gap-2">
                                        <Code size={24} className="text-cyan-200/70" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                                          Project Preview
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                    {item.category || activeProjectCategory}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    {item.liveLink && (
                                      <a
                                        href={item.liveLink}
                                        target="_blank"
                                        rel="noreferrer"
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
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-slate-800/70 text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-100"
                                        aria-label={`Open ${item.projectName} source code`}
                                      >
                                        <Github size={15} />
                                      </a>
                                    )}
                                  </div>
                                </div>

                                <div className="mt-3">
                                  <h4 className="text-base font-semibold leading-tight text-slate-100 md:text-[1.05rem]">
                                    {item.projectName}
                                  </h4>
                                  {item.role && <p className="mt-1 text-xs uppercase tracking-[0.16em] text-cyan-100/90">{item.role}</p>}
                                </div>

                                {visibleTechStack.length > 0 && (
                                  <div className="mt-3 flex flex-wrap gap-1.5">
                                    {visibleTechStack.map((tech, idx) => (
                                      <span
                                        key={`${tech}-${idx}`}
                                        className="rounded-full border border-white/12 bg-slate-800/60 px-2.5 py-1 text-[10px] text-slate-200"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                    {hasMoreTech && (
                                      <span className="rounded-full border border-white/12 bg-slate-800/35 px-2.5 py-1 text-[10px] text-slate-400">
                                        +{techStack.length - visibleTechStack.length}
                                      </span>
                                    )}
                                  </div>
                                )}

                                <p className={`mt-3 text-sm leading-relaxed text-slate-300 ${isExpanded ? '' : 'line-clamp-3'}`}>
                                  {item.description}
                                </p>

                                {isExpanded && hasContributors && (
                                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-800/40 p-4">
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Collaborators</p>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                      {item.contributors.join(', ')}
                                    </p>
                                  </div>
                                )}

                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                                  <div className="flex items-center gap-3">
                                    {item.liveLink && (
                                      <a
                                        href={item.liveLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-cyan-200 transition hover:text-cyan-100"
                                      >
                                        <ExternalLink size={12} /> Live
                                      </a>
                                    )}
                                    {item.githubLink && (
                                      <a
                                        href={item.githubLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 text-slate-300 transition hover:text-cyan-200"
                                      >
                                        <Github size={12} /> Code
                                      </a>
                                    )}
                                  </div>

                                  {canExpand && (
                                    <button
                                      onClick={() => toggleProject(item._id)}
                                      type="button"
                                      className="inline-flex items-center gap-1 text-slate-400 transition hover:text-cyan-200"
                                    >
                                      {isExpanded ? 'Show Less' : 'More Details'}
                                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                  )}
                                </div>
                              </div>
                            </MotionArticle>
                          );
                        })}
                      </div>
                    </MotionDiv>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <p className="text-sm text-slate-400">No projects added yet.</p>
            )}
          </div>
        </MotionSection>

        <MotionSection
          id="research"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="section-shell zone-blue border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <BookOpen className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Research <span className="text-cyan-200">Publications</span>
              </h2>
            </MotionDiv>

            {[
              { label: 'Journal', items: researchByType.journals },
              { label: 'Conference', items: researchByType.conferences },
            ].map(({ label, items }) => {
              if (!items.length) return null;

              return (
                <MotionDiv
                  key={label}
                  variants={CARD_STAGGER}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  className="mb-10"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{label}</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        {items.length} publication{items.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-slate-800/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                      {label}
                    </span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    {items.map((item) => {
                      const hasAuthors = Array.isArray(item.authors) && item.authors.length > 0;
                      const publicationDate = formatPublicationDate(item.publicationDate);

                      return (
                        <MotionArticle
                          key={item._id}
                          variants={CARD_ITEM}
                          className="glass-card card-sheen group relative overflow-hidden rounded-[28px] border-white/10 bg-slate-900/60 p-6 shadow-[0_18px_55px_rgba(6,10,22,0.22)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900/78"
                        >
                          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-cyan-300/10 via-transparent to-amber-200/5 opacity-70 transition duration-300 group-hover:opacity-100" />

                          <div className="relative z-10 flex h-full flex-col">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                                {label}
                              </span>
                              {publicationDate && (
                                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-slate-800/65 px-3 py-1 text-[11px] font-medium text-slate-300">
                                  <Calendar size={12} className="text-cyan-200" /> {publicationDate}
                                </span>
                              )}
                            </div>

                            <div className="mt-5">
                              <h4 className="text-xl font-semibold leading-tight text-slate-100">{item.title}</h4>
                              {item.publicationName && (
                                <p className="mt-3 text-sm leading-relaxed text-cyan-100/90">{item.publicationName}</p>
                              )}
                            </div>

                            {hasAuthors && (
                              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-800/40 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Authors</p>
                                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                                  {item.authors.join(', ')}
                                </p>
                              </div>
                            )}

                            <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                              <div className="text-xs text-slate-500">
                                {item.publicationDate ? new Date(item.publicationDate).getUTCFullYear() : ''}
                              </div>
                              {item.doiLink && (
                                <a
                                  href={item.doiLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
                                >
                                  Read Publication <ExternalLink size={13} />
                                </a>
                              )}
                            </div>
                          </div>
                        </MotionArticle>
                      );
                    })}
                  </div>
                </MotionDiv>
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
          className="section-shell zone-blue border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <Award className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Professional <span className="text-cyan-200">Certifications</span>
              </h2>
            </MotionDiv>

            {CERT_CATEGORIES.map((category) => {
              const items = certsByCategory[category] || [];
              if (!items.length) return null;
              const previewItems = items.filter((item) => item.featuredOnHome).slice(0, CERTIFICATE_PREVIEW_LIMIT);
              if (!previewItems.length) return null;

              return (
                <MotionDiv
                  key={category}
                  variants={CARD_STAGGER}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.15 }}
                  className="mb-10"
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h3 className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">{category}</h3>
                    <RouterLink
                      to={`/certifications#${getCategoryAnchor(category)}`}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-800/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300 transition hover:border-cyan-300/35 hover:text-cyan-200"
                    >
                      View All
                    </RouterLink>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {previewItems.map((item) => (
                      <MotionArticle
                        key={item._id}
                        variants={CARD_ITEM}
                        className="glass-card card-sheen border-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-semibold text-slate-100">{item.name}</h4>
                            <p className="mt-1 text-xs text-slate-400">{item.issuingOrganization}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                              {formatCertificateDate(item.issueDate)}
                            </p>
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
                      </MotionArticle>
                    ))}
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </MotionSection>

        <MotionSection
          id="education"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="section-shell zone-blue border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <GraduationCap className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Education <span className="text-cyan-200">Background</span>
              </h2>
            </MotionDiv>

            {education.length === 0 ? (
              <p className="text-sm text-slate-400">No education entries added yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {education.map((item) => (
                  <article
                    key={item._id}
                    className="glass-card card-sheen border-white/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold leading-snug text-slate-100">{item.degree}</h3>
                        <p className="mt-2 text-sm text-cyan-200">{item.institution}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-slate-800/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        {item.year}
                      </span>
                    </div>

                    {item.grade && (
                      <div className="mt-4 border-t border-white/10 pt-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Grade</p>
                        <p className="mt-2 text-sm text-slate-300">{item.grade}</p>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </MotionSection>

        <MotionSection
          id="hobbies"
          variants={SECTION_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="section-shell zone-blue border-t border-white/5 px-6 py-24 md:px-8"
        >
          <div className="mx-auto max-w-6xl">
            <MotionDiv variants={HEADER_VARIANTS} className="mb-10 flex items-center gap-3">
              <Heart className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Interests and <span className="text-cyan-200">Hobbies</span>
              </h2>
            </MotionDiv>

            {hobbies.length === 0 ? (
              <p className="text-sm text-slate-400">No hobbies added yet.</p>
            ) : (
              <MotionDiv
                variants={CARD_STAGGER}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
              >
                {hobbies.map((hobby) => (
                  <MotionArticle
                    key={hobby._id}
                    variants={CARD_ITEM}
                    className="glass-card card-sheen group relative overflow-hidden rounded-[24px] border-white/10 bg-slate-900/60 p-5 shadow-[0_18px_50px_rgba(6,10,22,0.18)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-slate-900/78"
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-cyan-300/10 via-transparent to-amber-200/5 opacity-70 transition duration-300 group-hover:opacity-100" />

                    <div className="relative z-10 flex h-full flex-col">
                      <div className="mb-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-xl text-cyan-200">
                          {hobby.icon || <Smile size={22} />}
                        </div>
                      </div>

                      <h4 className="text-lg font-semibold leading-snug text-slate-100">{hobby.name}</h4>
                      {hobby.description && (
                        <p className="mt-2 text-sm leading-relaxed text-slate-300">{hobby.description}</p>
                      )}
                    </div>
                  </MotionArticle>
                ))}
              </MotionDiv>
            )}
          </div>
        </MotionSection>

        <Contact />
      </main>

      <ChatWidget />

      <footer className="relative z-20 border-t border-white/10 bg-slate-900/75 px-6 py-10 text-center text-sm text-slate-500">
        <p>&copy; 2026 Shah Mohammad Rizvi. Built for professional outreach.</p>
      </footer>
    </div>
  );
};

export default Home;
