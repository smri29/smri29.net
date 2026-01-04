import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';

// Note: As we build About, Skills, Projects, etc., we will import them here.

const Home = () => {
  return (
    <div className="bg-dark-bg min-h-screen selection:bg-neon-pink selection:text-white">
      {/* Fixed Navigation */}
      <Navbar />

      {/* --- Global Background Elements --- */}
      {/* Top Left Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-pink/10 blur-[120px] rounded-full animate-pulse-slow -z-0"></div>
      
      {/* Bottom Right Glow */}
      <div className="fixed bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-purple-600/5 blur-[100px] rounded-full -z-0"></div>

      {/* --- Main Content Sections --- */}
      <main className="relative z-10">
        
        {/* Hero Section */}
        <Hero />

        {/* About Section Placeholder */}
        <section id="about" className="min-h-screen py-20 px-6 flex items-center justify-center border-t border-white/5">
           <div className="glass-card p-12 max-w-4xl w-full text-center">
              <h2 className="text-4xl font-bold mb-6 text-neon-pink">About Me</h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                I am a CSE student at IUBAT and an aspiring Machine Learning Engineer. 
                Currently serving as the Founder & President of CollabCircle.
              </p>
           </div>
        </section>

        {/* Skills Section Placeholder */}
        <section id="skills" className="min-h-screen py-20 px-6 flex flex-col items-center justify-center border-t border-white/5">
           <h2 className="text-4xl font-bold mb-12">Technical <span className="text-neon-pink">Skills</span></h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
              {/* We will map through your skill categories here later */}
              <div className="glass-card p-8 text-center hover:border-neon-pink/50 transition-all">
                <h3 className="text-xl font-bold mb-4">Frontend</h3>
                <p className="text-gray-400">React, Tailwind CSS, JavaScript</p>
              </div>
              <div className="glass-card p-8 text-center hover:border-neon-pink/50 transition-all">
                <h3 className="text-xl font-bold mb-4">Backend</h3>
                <p className="text-gray-400">Node.js, Express, MongoDB</p>
              </div>
              <div className="glass-card p-8 text-center hover:border-neon-pink/50 transition-all">
                <h3 className="text-xl font-bold mb-4">AI & ML</h3>
                <p className="text-gray-400">Python, PyTorch, Scikit-Learn</p>
              </div>
           </div>
        </section>

        {/* Projects Section Placeholder */}
        <section id="projects" className="min-h-screen py-20 px-6 border-t border-white/5">
           <div className="text-center mb-12">
              <h2 className="text-4xl font-bold">Featured <span className="text-neon-pink">Projects</span></h2>
           </div>
           <div className="flex justify-center">
              <p className="text-gray-500 italic">Project cards will be fetched from the backend...</p>
           </div>
        </section>

        {/* Contact Section Placeholder */}
        <section id="contact" className="py-20 px-6 border-t border-white/5">
           <div className="max-w-xl mx-auto glass-card p-10 text-center">
              <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
              <p className="text-gray-400 mb-8">Have a question or want to work together?</p>
              <button className="bg-neon-pink px-10 py-3 rounded-full font-bold">Say Hello</button>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-10 text-center border-t border-white/5 text-gray-600 text-sm">
        <p>© 2026 Shah Mohammad Rizvi. Built with MERN Stack.</p>
      </footer>
    </div>
  );
};

export default Home;