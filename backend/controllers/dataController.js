const Research = require('../models/Research');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// --- EMAIL CONFIG ---
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- HELPER: GET ALL (Sorted by Custom Order, then Date) ---
const getAll = (Model) => async (req, res) => {
  try {
    // 1. Sort by 'order' (ascending) first (0, 1, 2...)
    // 2. Then by 'createdAt' (newest first) as a fallback
    const items = await Model.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteItem = (Model) => async (req, res) => {
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item removed successfully' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// --- FIX: REORDER LOGIC ---
exports.reorderItems = async (req, res) => {
  const { type, items } = req.body; // items = [{ _id: '123', ... }, { _id: '456', ... }]
  
  let Model;
  if (type === 'research') Model = Research;
  else if (type === 'projects') Model = Project;
  else if (type === 'certificates') Model = Certificate;
  else if (type === 'skills') Model = Skill; // <--- ADDED THIS FOR SKILLS
  
  if (!Model) return res.status(400).json({ message: "Invalid type for reordering" });

  try {
    // Efficiently update multiple documents at once
    const bulkOps = items.map((item, index) => ({
      updateOne: {
        filter: { _id: item._id },
        // CRITICAL FIX: Added $set. Without this, MongoDB ignores the update.
        update: { $set: { order: index } } 
      }
    }));

    if (bulkOps.length > 0) {
      await Model.bulkWrite(bulkOps);
    }

    res.json({ success: true, message: "Order updated" });
  } catch (error) {
    console.error("Reorder Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- RESEARCH ---
exports.getResearch = getAll(Research);
exports.addResearch = async (req, res) => {
  try { res.status(201).json(await Research.create(req.body)); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.updateResearch = async (req, res) => {
  try { res.json(await Research.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.deleteResearch = deleteItem(Research);

// --- PROJECTS ---
exports.getProjects = getAll(Project);
exports.addProject = async (req, res) => {
  try { res.status(201).json(await Project.create(req.body)); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.updateProject = async (req, res) => {
  try { res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.deleteProject = deleteItem(Project);

// --- CERTIFICATES ---
exports.getCertificates = getAll(Certificate);
exports.addCertificate = async (req, res) => {
  try { res.status(201).json(await Certificate.create(req.body)); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.updateCertificate = async (req, res) => {
  try { res.json(await Certificate.findByIdAndUpdate(req.params.id, req.body, { new: true })); } 
  catch (error) { res.status(400).json({ message: error.message }); }
};
exports.deleteCertificate = deleteItem(Certificate);

// --- SKILLS ---
exports.getSkills = getAll(Skill);
exports.updateSkills = async (req, res) => {
  const { category, skillsList } = req.body;
  try {
    const updated = await Skill.findOneAndUpdate({ category }, { skillsList }, { upsert: true, new: true });
    res.json(updated);
  } catch (error) { res.status(400).json({ message: error.message }); }
};
exports.deleteSkill = deleteItem(Skill);

// --- MESSAGES ---
exports.getMessages = getAll(Message);
exports.sendMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const newMessage = await Message.create({ name, email, message });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: `Portfolio: New Message from ${name}`,
      html: `<div style="font-family: sans-serif; padding: 20px;">
              <h2 style="color: #ec4899;">New Submission</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Message:</strong> ${message}</p>
             </div>`
    };
    await transporter.sendMail(mailOptions);
    res.status(201).json({ success: true, data: newMessage });
  } catch (error) { res.status(500).json({ message: "DB saved, email failed", error: error.message }); }
};