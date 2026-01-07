import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { Cpu, Save, Trash2 } from 'lucide-react';

const SkillManager = () => {
  const [skillsData, setSkillsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Programming');
  const [currentSkills, setCurrentSkills] = useState('');

  const categories = [
    'Programming', 'AI/ML', 'Research', 'MLOps & Deployment', 
    'Full Stack Development', 'Tools & Platform', 'Soft Skills', 'Languages'
  ];

  useEffect(() => { fetchSkills(); }, []);

  const fetchSkills = async () => {
    const { data } = await API.get('/data/skills');
    setSkillsData(data);
    // Find if current category has existing skills
    const existing = data.find(s => s.category === selectedCategory);
    setCurrentSkills(existing ? existing.skillsList.join(', ') : '');
  };

  useEffect(() => {
    const existing = skillsData.find(s => s.category === selectedCategory);
    setCurrentSkills(existing ? existing.skillsList.join(', ') : '');
  }, [selectedCategory, skillsData]);

  const handleSave = async () => {
    try {
      const payload = {
        category: selectedCategory,
        skillsList: currentSkills.split(',').map(s => s.trim()).filter(s => s !== '')
      };
      await API.post('/data/skills', payload);
      toast.success(`${selectedCategory} skills updated!`);
      fetchSkills();
    } catch (err) { toast.error("Failed to update skills"); }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2"><Cpu className="text-neon-pink" /> Skill Matrix</h2>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Select Category</label>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all text-sm ${
                selectedCategory === cat ? 'bg-white/10 text-neon-pink border-l-4 border-neon-pink' : 'text-gray-400 hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="md:col-span-2">
          <div className="glass-card p-8 border-t-2 border-neon-pink">
            <h3 className="text-xl font-bold mb-4">Manage {selectedCategory}</h3>
            <p className="text-gray-500 text-sm mb-6">Enter skills separated by commas (e.g., Python, C++, Java)</p>
            
            <textarea
              className="w-full bg-white/5 border border-white/10 p-4 rounded-xl h-48 focus:border-neon-pink outline-none text-lg leading-relaxed"
              value={currentSkills}
              onChange={(e) => setCurrentSkills(e.target.value)}
              placeholder="Start typing skills..."
            />

            <button
              onClick={handleSave}
              className="w-full mt-6 bg-neon-pink py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-600 transition-all shadow-lg"
            >
              <Save size={20}/> Save {selectedCategory} Skills
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillManager;