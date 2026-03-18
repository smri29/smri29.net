import React, { useEffect, useState } from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowDown, Brain, Github, Linkedin } from 'lucide-react';
import API from '../api/axios';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const FALLBACK_HERO = {
  availabilityText: 'Open to Entry-Level Software & AI/ML Roles',
  roleTitles: ['AI/ML Engineer', 'Researcher', 'Full-Stack Developer', 'Founder, CollabCircle'],
  summary:
    'Building production-grade intelligence systems from model design to deployment. I focus on computer vision, practical deep learning, and reliable web platforms that create measurable impact.',
};

const Hero = () => {
  const [content, setContent] = useState(FALLBACK_HERO);

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        const { data } = await API.get('/data/hero');
        setContent({
          availabilityText: data?.availabilityText || FALLBACK_HERO.availabilityText,
          roleTitles:
            Array.isArray(data?.roleTitles) && data.roleTitles.length > 0
              ? data.roleTitles
              : FALLBACK_HERO.roleTitles,
          summary: data?.summary || FALLBACK_HERO.summary,
        });
      } catch (error) {
        console.error('Failed to load hero content', error);
      }
    };

    fetchHeroContent();
  }, []);

  return (
    <MotionSection
      id="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="zone-olive relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-24 md:px-8"
    >
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-20" />
      <div className="pointer-events-none absolute left-[8%] top-[16%] h-32 w-32 rounded-full border border-cyan-300/10 bg-cyan-300/10 blur-2xl" />
      <div className="pointer-events-none absolute bottom-[12%] right-[10%] h-28 w-28 rounded-full border border-amber-200/10 bg-amber-200/10 blur-2xl" />
      <MotionDiv
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <div>
          <MotionDiv
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="section-kicker mb-5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
            {content.availabilityText}
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15 }}
          >
            <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-slate-100 sm:text-6xl md:text-7xl">
              Shah Mohammad
              <span className="block bg-gradient-to-r from-cyan-200 via-cyan-300 to-amber-200 bg-clip-text text-transparent">
                Rizvi
              </span>
            </h1>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.22 }}
          >
            <p className="mt-6 h-8 text-base text-slate-300 md:text-xl">
              <Typewriter
                words={content.roleTitles}
                loop={0}
                cursor
                cursorStyle="_"
                typeSpeed={54}
                deleteSpeed={30}
                delaySpeed={1800}
              />
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3 }}
          >
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              {content.summary}
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="projects"
              smooth
              offset={-72}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 shadow-[0_14px_36px_rgba(34,211,238,0.18)] transition hover:scale-[1.02]"
            >
              Explore Projects
              <ArrowDown size={14} />
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-slate-900/35 p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-slate-900/35 p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.kaggle.com/shahmohammadrizvi"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-slate-900/35 p-2.5 text-slate-300 transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:text-cyan-200"
                title="Kaggle"
              >
                <Brain size={18} />
              </a>
            </div>
          </MotionDiv>
        </div>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="pointer-events-none absolute inset-4 rounded-[28px] bg-gradient-to-br from-cyan-300/15 via-transparent to-amber-200/10 blur-2xl" />
          <div className="glass-card card-sheen animate-float overflow-hidden border-cyan-300/20 p-3">
            <img
              src="/smr.jpg"
              alt="Shah Mohammad Rizvi"
              className="aspect-[4/5] w-full rounded-xl object-cover"
              loading="eager"
            />
          </div>
        </MotionDiv>
      </MotionDiv>
    </MotionSection>
  );
};

export default Hero;
