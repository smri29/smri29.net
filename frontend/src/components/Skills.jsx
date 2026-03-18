import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import API from '../api/axios';
import { ChevronDown, ChevronUp, Cpu } from 'lucide-react';

const MotionSection = motion.section;
const MotionArticle = motion.article;

const SECTION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
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

const ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const PREVIEW_SKILLS_LIMIT = 6;

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await API.get('/data/skills');
        setSkillCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load skills', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const normalizedCategories = useMemo(() => {
    return skillCategories.map((category) => ({
      ...category,
      skillsList: Array.isArray(category.skillsList)
        ? category.skillsList.filter(Boolean)
        : [],
    }));
  }, [skillCategories]);

  useEffect(() => {
    if (!normalizedCategories.length) {
      setActiveCategoryId(null);
      return;
    }

    setActiveCategoryId((current) =>
      normalizedCategories.some((category) => category._id === current)
        ? current
        : normalizedCategories[0]._id
    );
  }, [normalizedCategories]);

  const activeCategory = useMemo(
    () => normalizedCategories.find((category) => category._id === activeCategoryId) || null,
    [activeCategoryId, normalizedCategories]
  );

  const isExpanded = activeCategory ? Boolean(expandedCategories[activeCategory._id]) : false;
  const visibleSkills = activeCategory
    ? isExpanded
      ? activeCategory.skillsList
      : activeCategory.skillsList.slice(0, PREVIEW_SKILLS_LIMIT)
    : [];

  const toggleExpanded = () => {
    if (!activeCategory) {
      return;
    }

    setExpandedCategories((current) => ({
      ...current,
      [activeCategory._id]: !current[activeCategory._id],
    }));
  };

  return (
    <MotionSection
      id="skills"
      variants={SECTION_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      className="section-shell zone-blue border-t border-white/5 px-6 py-24 backdrop-blur-sm md:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Cpu className="text-cyan-300" size={28} />
              <h2 className="section-title">
                Technical <span className="text-cyan-200">Proficiency</span>
              </h2>
            </div>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading skills...</p>
        ) : normalizedCategories.length > 0 ? (
          <>
            <div className="mb-8 flex flex-wrap gap-3">
              {normalizedCategories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => setActiveCategoryId(category._id)}
                    className={`rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition ${
                    activeCategoryId === category._id
                      ? 'border-cyan-300/40 bg-cyan-300/12 text-cyan-100 shadow-[0_8px_20px_rgba(34,211,238,0.08)]'
                      : 'border-white/10 bg-slate-800/70 text-slate-300 hover:-translate-y-0.5 hover:border-cyan-300/35 hover:text-cyan-200'
                  }`}
                >
                  {category.category}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeCategory && (
                <MotionArticle
                  key={activeCategory._id}
                  variants={ITEM_VARIANTS}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, y: -10, transition: { duration: 0.2, ease: 'easeOut' } }}
                  className="glass-card card-sheen overflow-hidden border-white/10 p-0"
                >
                  <div className="grid xl:grid-cols-[280px_1fr]">
                    <div className="relative border-b border-white/10 bg-gradient-to-br from-slate-900/75 via-slate-900/55 to-cyan-300/10 p-6 md:p-8 xl:border-b-0 xl:border-r">
                      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-cyan-300/12 via-transparent to-amber-200/5" />

                      <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Category</p>
                          <h3 className="mt-3 text-2xl font-semibold leading-tight text-slate-100">
                            {activeCategory.category}
                          </h3>
                        </div>

                        {activeCategory.skillsList.length > PREVIEW_SKILLS_LIMIT && (
                          <button
                            type="button"
                            onClick={toggleExpanded}
                            className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-100 transition hover:border-cyan-300/40 hover:bg-cyan-300/15"
                          >
                            {isExpanded ? 'Show Less' : 'View All'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="p-6 md:p-8">
                      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                        {visibleSkills.map((skill, idx) => (
                          <motion.div
                            key={`${activeCategory._id}-${skill}-${idx}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22, ease: 'easeOut', delay: idx * 0.02 }}
                            className="rounded-2xl border border-white/10 bg-slate-800/45 px-4 py-3 text-sm text-slate-200 transition duration-300 hover:-translate-y-0.5 hover:border-cyan-300/25 hover:bg-slate-800/65"
                          >
                            <span className="inline-flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-cyan-300/80" />
                              {skill}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {activeCategory.skillsList.length > PREVIEW_SKILLS_LIMIT && (
                        <div className="mt-6 border-t border-white/10 pt-5">
                          <button
                            type="button"
                            onClick={toggleExpanded}
                            className="inline-flex items-center gap-2 text-sm font-medium text-cyan-200 transition hover:text-cyan-100"
                          >
                            {isExpanded ? 'Show Less' : 'View All Skills'}
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </MotionArticle>
              )}
            </AnimatePresence>
          </>
        ) : (
          <p className="text-sm italic text-slate-400">Skills have not been added yet.</p>
        )}
      </div>
    </MotionSection>
  );
};

export default Skills;
