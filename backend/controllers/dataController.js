const Research = require('../models/Research');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Message = require('../models/Message');
const Experience = require('../models/Experience');
const Hobby = require('../models/Hobby');
const nodemailer = require('nodemailer');

const PROJECT_CATEGORIES = new Set(['AI/ML', 'MERN', 'Flutter', 'Others']);
const RESEARCH_TYPES = new Set(['Journal', 'Conference']);
const CERTIFICATE_CATEGORIES = new Set(['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizeString = (value, maxLength = 5000) => String(value ?? '').trim().slice(0, maxLength);
const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item, 200)).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => normalizeString(item, 200))
    .filter(Boolean);
};

const parseDate = (value) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const isValidUrl = (value) => {
  const url = normalizeString(value, 2048);
  if (!url) {
    return true;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

let transporter = null;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  const transportConfig = process.env.EMAIL_SERVICE
    ? { service: process.env.EMAIL_SERVICE }
    : process.env.EMAIL_HOST
      ? {
          host: process.env.EMAIL_HOST,
          port: Number(process.env.EMAIL_PORT || 587),
          secure: process.env.EMAIL_SECURE === 'true',
        }
      : null;

  if (transportConfig) {
    transporter = nodemailer.createTransport({
      ...transportConfig,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
}

const getModelSort = (Model) => {
  if (Model.schema.path('order')) {
    return { order: 1, createdAt: -1 };
  }
  return { createdAt: -1 };
};

const getAll = (Model) => async (req, res) => {
  const items = await Model.find().sort(getModelSort(Model)).lean();
  res.json(items);
};

const deleteItem = (Model) => async (req, res) => {
  const item = await Model.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json({ message: 'Item removed successfully' });
};

exports.reorderItems = async (req, res) => {
  const { type, items } = req.body;

  let Model;
  if (type === 'research') Model = Research;
  else if (type === 'projects') Model = Project;
  else if (type === 'certificates') Model = Certificate;
  else if (type === 'skills') Model = Skill;
  else if (type === 'experience') Model = Experience;
  else if (type === 'hobbies') Model = Hobby;

  if (!Model) {
    return res.status(400).json({ message: 'Invalid type for reordering' });
  }

  if (!Array.isArray(items) || items.some((item) => !item?._id)) {
    return res.status(400).json({ message: 'Invalid reorder payload' });
  }

  const bulkOps = items.map((item, index) => ({
    updateOne: {
      filter: { _id: item._id },
      update: { $set: { order: index } },
    },
  }));

  if (bulkOps.length > 0) {
    await Model.bulkWrite(bulkOps);
  }

  return res.json({ success: true, message: 'Order updated' });
};

exports.getResearch = getAll(Research);
exports.addResearch = async (req, res) => {
  const payload = {
    title: normalizeString(req.body.title, 200),
    abstract: normalizeString(req.body.abstract, 6000),
    type: normalizeString(req.body.type, 20),
    publicationName: normalizeString(req.body.publicationName, 300),
    publicationDate: parseDate(req.body.publicationDate),
    doiLink: normalizeString(req.body.doiLink, 2048),
    authors: normalizeList(req.body.authors),
    isPeerReviewed: Boolean(req.body.isPeerReviewed),
  };

  if (!payload.title || !payload.abstract || !payload.publicationName || !payload.publicationDate) {
    return res.status(400).json({ message: 'Required research fields are missing' });
  }

  if (!RESEARCH_TYPES.has(payload.type)) {
    return res.status(400).json({ message: 'Invalid research type' });
  }

  if (!isValidUrl(payload.doiLink)) {
    return res.status(400).json({ message: 'Invalid DOI/publication URL' });
  }

  const created = await Research.create(payload);
  return res.status(201).json(created);
};

exports.updateResearch = async (req, res) => {
  const update = {
    ...(req.body.title !== undefined && { title: normalizeString(req.body.title, 200) }),
    ...(req.body.abstract !== undefined && { abstract: normalizeString(req.body.abstract, 6000) }),
    ...(req.body.type !== undefined && { type: normalizeString(req.body.type, 20) }),
    ...(req.body.publicationName !== undefined && { publicationName: normalizeString(req.body.publicationName, 300) }),
    ...(req.body.publicationDate !== undefined && { publicationDate: parseDate(req.body.publicationDate) }),
    ...(req.body.doiLink !== undefined && { doiLink: normalizeString(req.body.doiLink, 2048) }),
    ...(req.body.authors !== undefined && { authors: normalizeList(req.body.authors) }),
    ...(req.body.isPeerReviewed !== undefined && { isPeerReviewed: Boolean(req.body.isPeerReviewed) }),
  };

  if (update.type && !RESEARCH_TYPES.has(update.type)) {
    return res.status(400).json({ message: 'Invalid research type' });
  }

  if (update.publicationDate === null) {
    return res.status(400).json({ message: 'Invalid publication date' });
  }

  if (update.doiLink !== undefined && !isValidUrl(update.doiLink)) {
    return res.status(400).json({ message: 'Invalid DOI/publication URL' });
  }

  const updated = await Research.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteResearch = deleteItem(Research);

exports.getProjects = getAll(Project);
exports.addProject = async (req, res) => {
  const payload = {
    projectName: normalizeString(req.body.projectName, 200),
    description: normalizeString(req.body.description, 5000),
    techStack: normalizeList(req.body.techStack),
    category: normalizeString(req.body.category, 20) || 'Others',
    githubLink: normalizeString(req.body.githubLink, 2048),
    liveLink: normalizeString(req.body.liveLink, 2048),
    role: normalizeString(req.body.role, 200) || 'Lead Developer',
    contributors: normalizeList(req.body.contributors),
  };

  if (!payload.projectName || !payload.description) {
    return res.status(400).json({ message: 'Project name and description are required' });
  }

  if (!PROJECT_CATEGORIES.has(payload.category)) {
    return res.status(400).json({ message: 'Invalid project category' });
  }

  if (!isValidUrl(payload.githubLink) || !isValidUrl(payload.liveLink)) {
    return res.status(400).json({ message: 'Invalid GitHub or live URL' });
  }

  const created = await Project.create(payload);
  return res.status(201).json(created);
};

exports.updateProject = async (req, res) => {
  const update = {
    ...(req.body.projectName !== undefined && { projectName: normalizeString(req.body.projectName, 200) }),
    ...(req.body.description !== undefined && { description: normalizeString(req.body.description, 5000) }),
    ...(req.body.techStack !== undefined && { techStack: normalizeList(req.body.techStack) }),
    ...(req.body.category !== undefined && { category: normalizeString(req.body.category, 20) }),
    ...(req.body.githubLink !== undefined && { githubLink: normalizeString(req.body.githubLink, 2048) }),
    ...(req.body.liveLink !== undefined && { liveLink: normalizeString(req.body.liveLink, 2048) }),
    ...(req.body.role !== undefined && { role: normalizeString(req.body.role, 200) }),
    ...(req.body.contributors !== undefined && { contributors: normalizeList(req.body.contributors) }),
  };

  if (update.category && !PROJECT_CATEGORIES.has(update.category)) {
    return res.status(400).json({ message: 'Invalid project category' });
  }

  if ((update.githubLink !== undefined && !isValidUrl(update.githubLink)) || (update.liveLink !== undefined && !isValidUrl(update.liveLink))) {
    return res.status(400).json({ message: 'Invalid GitHub or live URL' });
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteProject = deleteItem(Project);

exports.getCertificates = getAll(Certificate);
exports.addCertificate = async (req, res) => {
  const payload = {
    name: normalizeString(req.body.name, 300),
    issuingOrganization: normalizeString(req.body.issuingOrganization, 300),
    issueDate: parseDate(req.body.issueDate),
    verificationLink: normalizeString(req.body.verificationLink, 2048),
    category: normalizeString(req.body.category, 30),
  };

  if (!payload.name || !payload.issuingOrganization || !payload.issueDate || !payload.category) {
    return res.status(400).json({ message: 'Required certificate fields are missing' });
  }

  if (!CERTIFICATE_CATEGORIES.has(payload.category)) {
    return res.status(400).json({ message: 'Invalid certificate category' });
  }

  if (!isValidUrl(payload.verificationLink)) {
    return res.status(400).json({ message: 'Invalid certificate verification URL' });
  }

  const created = await Certificate.create(payload);
  return res.status(201).json(created);
};

exports.updateCertificate = async (req, res) => {
  const update = {
    ...(req.body.name !== undefined && { name: normalizeString(req.body.name, 300) }),
    ...(req.body.issuingOrganization !== undefined && { issuingOrganization: normalizeString(req.body.issuingOrganization, 300) }),
    ...(req.body.issueDate !== undefined && { issueDate: parseDate(req.body.issueDate) }),
    ...(req.body.verificationLink !== undefined && { verificationLink: normalizeString(req.body.verificationLink, 2048) }),
    ...(req.body.category !== undefined && { category: normalizeString(req.body.category, 30) }),
  };

  if (update.issueDate === null) {
    return res.status(400).json({ message: 'Invalid issue date' });
  }

  if (update.category && !CERTIFICATE_CATEGORIES.has(update.category)) {
    return res.status(400).json({ message: 'Invalid certificate category' });
  }

  if (update.verificationLink !== undefined && !isValidUrl(update.verificationLink)) {
    return res.status(400).json({ message: 'Invalid certificate verification URL' });
  }

  const updated = await Certificate.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteCertificate = deleteItem(Certificate);

exports.getSkills = getAll(Skill);
exports.updateSkills = async (req, res) => {
  const category = normalizeString(req.body.category, 100);
  const skillsList = normalizeList(req.body.skillsList);

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  const updated = await Skill.findOneAndUpdate(
    { category },
    { category, skillsList },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json(updated);
};
exports.deleteSkill = deleteItem(Skill);

exports.getExperience = getAll(Experience);
exports.addExperience = async (req, res) => {
  const payload = {
    role: normalizeString(req.body.role, 200),
    company: normalizeString(req.body.company, 200),
    duration: normalizeString(req.body.duration, 100),
    location: normalizeString(req.body.location, 200),
    description: normalizeString(req.body.description, 5000),
  };

  if (!payload.role || !payload.company || !payload.duration || !payload.description) {
    return res.status(400).json({ message: 'Required experience fields are missing' });
  }

  const created = await Experience.create(payload);
  return res.status(201).json(created);
};

exports.updateExperience = async (req, res) => {
  const update = {
    ...(req.body.role !== undefined && { role: normalizeString(req.body.role, 200) }),
    ...(req.body.company !== undefined && { company: normalizeString(req.body.company, 200) }),
    ...(req.body.duration !== undefined && { duration: normalizeString(req.body.duration, 100) }),
    ...(req.body.location !== undefined && { location: normalizeString(req.body.location, 200) }),
    ...(req.body.description !== undefined && { description: normalizeString(req.body.description, 5000) }),
  };

  const updated = await Experience.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteExperience = deleteItem(Experience);

exports.getHobbies = getAll(Hobby);
exports.addHobby = async (req, res) => {
  const payload = {
    name: normalizeString(req.body.name, 100),
    description: normalizeString(req.body.description, 300),
    icon: normalizeString(req.body.icon, 16),
  };

  if (!payload.name) {
    return res.status(400).json({ message: 'Hobby name is required' });
  }

  const created = await Hobby.create(payload);
  return res.status(201).json(created);
};

exports.updateHobby = async (req, res) => {
  const update = {
    ...(req.body.name !== undefined && { name: normalizeString(req.body.name, 100) }),
    ...(req.body.description !== undefined && { description: normalizeString(req.body.description, 300) }),
    ...(req.body.icon !== undefined && { icon: normalizeString(req.body.icon, 16) }),
  };

  const updated = await Hobby.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteHobby = deleteItem(Hobby);

exports.getMessages = getAll(Message);
exports.sendMessage = async (req, res) => {
  const name = normalizeString(req.body.name, 120);
  const email = normalizeString(req.body.email, 160).toLowerCase();
  const message = normalizeString(req.body.message, 4000);

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Name, email and message are required' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ message: 'Please provide a valid email' });
  }

  const newMessage = await Message.create({ name, email, message });

  let emailStatus = 'skipped';
  if (transporter && process.env.EMAIL_RECEIVER) {
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_RECEIVER,
        replyTo: email,
        subject: `Portfolio: New message from ${name}`,
        html: `<div style="font-family: Arial, sans-serif; padding: 16px; line-height: 1.5;">
                <h2 style="margin: 0 0 12px; color: #ec4899;">New Portfolio Message</h2>
                <p><strong>Name:</strong> ${escapeHtml(name)}</p>
                <p><strong>Email:</strong> ${escapeHtml(email)}</p>
                <p><strong>Message:</strong><br/>${escapeHtml(message).replace(/\n/g, '<br/>')}</p>
              </div>`,
      });
      emailStatus = 'sent';
    } catch (error) {
      console.error('Email send failed:', error.message);
      emailStatus = 'failed';
    }
  }

  return res.status(201).json({ success: true, data: newMessage, emailStatus });
};

exports.deleteMessage = deleteItem(Message);
