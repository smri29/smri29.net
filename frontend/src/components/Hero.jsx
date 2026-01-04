import React from 'react';
import { Typewriter } from 'react-simple-typewriter';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="text-center z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-neon-pink font-medium tracking-widest uppercase mb-4">
            Welcome to my universe
          </h2>
          <h1 className="text-6xl md:text-8xl font-extrabold mb-6 tracking-tight">
            I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500">Rizvi</span>
          </h1>
          
          <div className="text-2xl md:text-4xl font-light text-gray-400 h-12">
            <Typewriter
              words={['ML Researcher', 'Full Stack Developer', 'Founder @ CollabCircle', 'Problem Solver']}
              loop={0}
              cursor
              cursorStyle='|'
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1500}
            />
          </div>

          <div className="mt-10 flex flex-col md:flex-row gap-6 justify-center">
            <button className="px-8 py-3 bg-neon-pink text-white rounded-full font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all">
              View My Work
            </button>
            <button className="px-8 py-3 glass-card border border-white/20 hover:border-neon-pink/50 transition-all">
              Let's Connect
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative blurred circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-neon-pink/20 blur-[120px] rounded-full -z-10"></div>
    </section>
  );
};

export default Hero;