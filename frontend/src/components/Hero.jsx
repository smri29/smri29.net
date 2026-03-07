import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';
import { Link } from 'react-scroll';
import { ArrowDown, Brain, Github, Linkedin } from 'lucide-react';

const MotionSection = motion.section;
const MotionDiv = motion.div;

const Hero = () => {
  return (
    <MotionSection
      id="hero"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 pb-16 pt-24 md:px-8"
    >
      <div className="pointer-events-none absolute inset-0 subtle-grid opacity-20" />
      <MotionDiv
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center"
      >
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.26em] text-cyan-200">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 animate-pulse" />
            Open to Entry-Level Software & AI/ML Roles
          </div>

          <h1 className="font-serif text-5xl leading-[0.95] tracking-tight text-slate-100 sm:text-6xl md:text-7xl">
            Shah Mohammad
            <span className="block bg-gradient-to-r from-cyan-200 via-cyan-300 to-amber-200 bg-clip-text text-transparent">
              Rizvi
            </span>
          </h1>

          <p className="mt-6 h-8 text-base text-slate-300 md:text-xl">
            <Typewriter
              words={['AI/ML Engineer', 'Researcher', 'Full-Stack Developer', 'Founder, CollabCircle']}
              loop={0}
              cursor
              cursorStyle="_"
              typeSpeed={54}
              deleteSpeed={30}
              delaySpeed={1800}
            />
          </p>

          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
            Building production-grade intelligence systems from model design to deployment. I focus on computer vision,
            practical deep learning, and reliable web platforms that create measurable impact.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="projects"
              smooth
              offset={-72}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-slate-950 transition hover:scale-[1.02]"
            >
              Explore Projects
              <ArrowDown size={14} />
            </Link>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
                title="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/smri29"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.kaggle.com/shahmohammadrizvi"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 p-2.5 text-slate-300 transition hover:border-cyan-300/60 hover:text-cyan-200"
                title="Kaggle"
              >
                <Brain size={18} />
              </a>
            </div>
          </div>
        </div>

        <MotionDiv
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="glass-card overflow-hidden border-cyan-300/20 p-3">
            <img
              src="/smr.jpg"
              alt="Shah Mohammad Rizvi"
              className="aspect-[4/5] w-full rounded-xl object-cover"
              loading="eager"
            />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-1 text-[11px] uppercase tracking-[0.22em] text-amber-100">
            AI + Engineering
          </div>
        </MotionDiv>
      </MotionDiv>
    </MotionSection>
  );
};

export default Hero;
