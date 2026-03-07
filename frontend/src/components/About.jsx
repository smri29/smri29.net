import React from 'react';
import { motion } from 'framer-motion';
import { Award, BookOpen, GraduationCap } from 'lucide-react';

const MotionDiv = motion.div;

const About = () => {
  const highlights = [
    { icon: <GraduationCap size={18} />, title: 'Education', detail: 'BSc in CSE, IUBAT (CGPA 3.82)' },
    { icon: <BookOpen size={18} />, title: 'Research', detail: '7+ publications in ML and Computer Vision' },
    { icon: <Award size={18} />, title: 'Leadership', detail: 'Founder and President, CollabCircle' },
  ];

  return (
    <section id="about" className="px-6 py-24 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <MotionDiv
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="glass-card overflow-hidden border-cyan-300/20 p-3">
              <img
                src="/smr_d.jpg"
                alt="Shah Mohammad Rizvi portrait"
                className="aspect-[4/5] w-full rounded-xl object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -right-4 -top-4 hidden h-24 w-24 rounded-2xl border border-amber-200/25 bg-amber-200/10 lg:block" />
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="mb-2 text-xs uppercase tracking-[0.24em] text-cyan-200">Introduction</p>
            <h2 className="section-title font-serif text-4xl md:text-5xl">
              Research mindset,
              <span className="block text-cyan-200">production execution.</span>
            </h2>

            <p className="mt-6 text-sm leading-relaxed text-slate-300 md:text-base">
              I design and deploy AI systems that solve practical problems. My focus spans model experimentation,
              data-centric pipelines, and scalable MERN-based interfaces. I prioritize clean architecture, measurable
              outcomes, and communication that keeps engineering teams aligned.
            </p>

            <div className="mt-8 grid gap-3">
              {highlights.map((item) => (
                <div
                  key={item.title}
                  className="glass-card flex items-center gap-3 border-white/10 p-4 transition hover:border-cyan-300/35"
                >
                  <div className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 p-2 text-cyan-200">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">{item.title}</h3>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </MotionDiv>
        </div>
      </div>
    </section>
  );
};

export default About;
