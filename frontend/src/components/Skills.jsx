import React from 'react';

const Skills = () => {
  const categories = [
    { title: "AI/ML", skills: ["Python", "PyTorch", "TensorFlow", "Computer Vision", "Deep Learning"] },
    { title: "Full Stack", skills: ["React.js", "Node.js", "Express.js", "MongoDB", "Tailwind CSS"] },
    { title: "Research", skills: ["Scientific Writing", "Data Analysis", "LaTeX", "Methodology"] },
    { title: "Tools", skills: ["Git", "GitHub", "Linux", "VS Code", "Postman"] },
    { title: "Soft Skills", skills: ["Leadership", "Public Speaking", "Collaboration", "Critical Thinking"] }
  ];

  return (
    <section id="skills" className="py-24 px-6 bg-black/20">
      <div className="max-w-6xl mx-auto text-white">
        <h2 className="text-3xl font-bold mb-12 text-center">Technical <span className="text-neon-pink">Proficiency</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, idx) => (
            <div key={idx} className="glass-card p-8 border-t-4 border-t-neon-pink/50">
              <h3 className="text-xl font-bold mb-6">{cat.title}</h3>
              <div className="flex flex-wrap gap-2">
                {cat.skills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;