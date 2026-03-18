const Research = require('../models/Research');
const Project = require('../models/Project');
const Certificate = require('../models/Certificate');
const Skill = require('../models/Skill');
const Message = require('../models/Message');
const HeroContent = require('../models/HeroContent');
const Introduction = require('../models/Introduction');
const Experience = require('../models/Experience');
const Education = require('../models/Education');
const Hobby = require('../models/Hobby');
const nodemailer = require('nodemailer');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

const PROJECT_CATEGORIES = new Set(['AI/ML', 'MERN', 'Flutter', 'Others']);
const RESEARCH_TYPES = new Set(['Journal', 'Conference']);
const CERTIFICATE_CATEGORIES = new Set(['AI/ML', 'Kaggle', 'Research', 'Professional', 'Others']);
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_HOME_CERTIFICATES_PER_CATEGORY = 3;

const normalizeString = (value, maxLength = 5000) => String(value ?? '').trim().slice(0, maxLength);
const normalizeBoolean = (value) => value === true || value === 'true' || value === 1 || value === '1' || value === 'on';
const normalizeList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeString(item, 200)).filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => normalizeString(item, 200))
    .filter(Boolean);
};

const normalizeImageData = (value) => {
  const normalized = normalizeString(value, 10_000_000);
  return normalized.startsWith('data:image/') ? normalized : '';
};

const parseDate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const formatMonthYear = (value) => {
  const parsed = parseDate(value);
  if (!parsed) {
    return '';
  }

  return `${MONTH_LABELS[parsed.getUTCMonth()]} ${parsed.getUTCFullYear()}`;
};

const buildExperienceDuration = ({ startDate, endDate, currentlyWorking }) => {
  const startLabel = formatMonthYear(startDate);
  if (!startLabel) {
    return '';
  }

  if (currentlyWorking) {
    return `${startLabel} - Present`;
  }

  const endLabel = formatMonthYear(endDate);
  return endLabel ? `${startLabel} - ${endLabel}` : startLabel;
};

const assertCertificateFeaturedLimit = async ({ category, featuredOnHome, excludeId = null }) => {
  if (!featuredOnHome) {
    return;
  }

  const query = { category, featuredOnHome: true };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const featuredCount = await Certificate.countDocuments(query);
  if (featuredCount >= MAX_HOME_CERTIFICATES_PER_CATEGORY) {
    throw new Error(`Only ${MAX_HOME_CERTIFICATES_PER_CATEGORY} certificates per category can be shown on the homepage`);
  }
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

const serializeResearch = (item) => ({
  _id: item._id,
  title: item.title || '',
  type: item.type || '',
  publicationName: item.publicationName || '',
  publicationDate: item.publicationDate || null,
  doiLink: item.doiLink || '',
  authors: Array.isArray(item.authors) ? item.authors : [],
  isPeerReviewed: Boolean(item.isPeerReviewed),
  order: item.order ?? 0,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeExperience = (item) => ({
  _id: item._id,
  companyName: item.companyName || item.company || '',
  jobTitle: item.jobTitle || item.role || '',
  currentlyWorking: Boolean(item.currentlyWorking),
  startDate: item.startDate || null,
  endDate: item.endDate || null,
  location: item.location || '',
  description: item.description || '',
  order: item.order ?? 0,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const DEFAULT_INTRODUCTION = {
  introLabel: 'Introduction',
  headingPrimary: 'Research mindset,',
  headingAccent: 'production execution.',
  description:
    'I design and deploy AI systems that solve practical problems. My focus spans model experimentation, data-centric pipelines, and scalable MERN-based interfaces. I prioritize clean architecture, measurable outcomes, and communication that keeps engineering teams aligned.',
  highlights: [
    { title: 'Education', detail: 'BSc in CSE, IUBAT', iconKey: 'education', order: 0 },
    { title: 'Research', detail: '7+ publications in ML and Computer Vision', iconKey: 'research', order: 1 },
    { title: 'Leadership', detail: 'Founder and President, CollabCircle', iconKey: 'leadership', order: 2 },
  ],
};

const serializeIntroduction = (item) => ({
  introLabel: item?.introLabel || DEFAULT_INTRODUCTION.introLabel,
  headingPrimary: item?.headingPrimary || DEFAULT_INTRODUCTION.headingPrimary,
  headingAccent: item?.headingAccent || DEFAULT_INTRODUCTION.headingAccent,
  description: item?.description || DEFAULT_INTRODUCTION.description,
  highlights: (Array.isArray(item?.highlights) ? item.highlights : DEFAULT_INTRODUCTION.highlights)
    .map((highlight, index) => ({
      _id: highlight._id,
      title: highlight.title || '',
      detail: highlight.detail || '',
      iconKey: highlight.iconKey || 'education',
      order: highlight.order ?? index,
    }))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  updatedAt: item?.updatedAt,
});

const DEFAULT_HERO_CONTENT = {
  availabilityText: 'Open to Entry-Level Software & AI/ML Roles',
  roleTitles: ['AI/ML Engineer', 'Researcher', 'Full-Stack Developer', 'Founder, CollabCircle'],
  summary:
    'Building production-grade intelligence systems from model design to deployment. I focus on computer vision, practical deep learning, and reliable web platforms that create measurable impact.',
};

const serializeHeroContent = (item) => ({
  availabilityText: item?.availabilityText || DEFAULT_HERO_CONTENT.availabilityText,
  roleTitles:
    Array.isArray(item?.roleTitles) && item.roleTitles.length > 0
      ? item.roleTitles.filter(Boolean)
      : DEFAULT_HERO_CONTENT.roleTitles,
  summary: item?.summary || DEFAULT_HERO_CONTENT.summary,
  updatedAt: item?.updatedAt,
});

const serializeProject = (item) => ({
  _id: item._id,
  projectName: item.projectName || '',
  description: item.description || '',
  techStack: Array.isArray(item.techStack) ? item.techStack : [],
  category: item.category || 'Others',
  githubLink: item.githubLink || '',
  liveLink: item.liveLink || '',
  role: item.role || '',
  contributors: Array.isArray(item.contributors) ? item.contributors : [],
  imageUrl: item.imageUrl || '',
  order: item.order ?? 0,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const uploadProjectImage = async (imageData) => {
  if (!imageData) {
    return null;
  }

  if (!hasCloudinaryConfig()) {
    throw new Error('Cloudinary credentials are missing on the server');
  }

  const uploadResult = await cloudinary.uploader.upload(imageData, {
    folder: 'smri29/projects',
    resource_type: 'image',
  });

  return {
    imageUrl: uploadResult.secure_url || '',
    imagePublicId: uploadResult.public_id || '',
  };
};

const destroyProjectImage = async (publicId) => {
  if (!publicId || !hasCloudinaryConfig()) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
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
  else if (type === 'education') Model = Education;
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

exports.getResearch = async (req, res) => {
  const items = await Research.find().sort(getModelSort(Research)).lean();
  res.json(items.map(serializeResearch));
};
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

  if (!payload.title || !payload.publicationName || !payload.publicationDate) {
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

exports.getProjects = async (req, res) => {
  const items = await Project.find().sort(getModelSort(Project)).lean();
  res.json(items.map(serializeProject));
};
exports.addProject = async (req, res) => {
  const imageData = normalizeImageData(req.body.imageData);
  const payload = {
    projectName: normalizeString(req.body.projectName, 200),
    description: normalizeString(req.body.description, 5000),
    techStack: normalizeList(req.body.techStack),
    category: normalizeString(req.body.category, 20) || 'Others',
    githubLink: normalizeString(req.body.githubLink, 2048),
    liveLink: normalizeString(req.body.liveLink, 2048),
    role: normalizeString(req.body.role, 200) || 'Lead Developer',
    contributors: normalizeList(req.body.contributors),
    imageUrl: '',
    imagePublicId: '',
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

  const uploadedImage = await uploadProjectImage(imageData);
  if (uploadedImage) {
    payload.imageUrl = uploadedImage.imageUrl;
    payload.imagePublicId = uploadedImage.imagePublicId;
  }

  const created = await Project.create(payload);
  return res.status(201).json(serializeProject(created.toObject()));
};

exports.updateProject = async (req, res) => {
  const existing = await Project.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const imageData = normalizeImageData(req.body.imageData);
  const removeImage = normalizeBoolean(req.body.removeImage);
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

  if (imageData) {
    const uploadedImage = await uploadProjectImage(imageData);
    if (uploadedImage) {
      if (existing.imagePublicId) {
        await destroyProjectImage(existing.imagePublicId);
      }

      update.imageUrl = uploadedImage.imageUrl;
      update.imagePublicId = uploadedImage.imagePublicId;
    }
  } else if (removeImage) {
    if (existing.imagePublicId) {
      await destroyProjectImage(existing.imagePublicId);
    }

    update.imageUrl = '';
    update.imagePublicId = '';
  }

  const updated = await Project.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  return res.json(serializeProject(updated.toObject()));
};
exports.deleteProject = async (req, res) => {
  const item = await Project.findByIdAndDelete(req.params.id);
  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  if (item.imagePublicId) {
    await destroyProjectImage(item.imagePublicId);
  }

  return res.json({ message: 'Item removed successfully' });
};

exports.getCertificates = getAll(Certificate);
exports.addCertificate = async (req, res) => {
  const payload = {
    name: normalizeString(req.body.name, 300),
    issuingOrganization: normalizeString(req.body.issuingOrganization, 300),
    issueDate: parseDate(req.body.issueDate),
    verificationLink: normalizeString(req.body.verificationLink, 2048),
    category: normalizeString(req.body.category, 30),
    featuredOnHome: normalizeBoolean(req.body.featuredOnHome),
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

  try {
    await assertCertificateFeaturedLimit({
      category: payload.category,
      featuredOnHome: payload.featuredOnHome,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const created = await Certificate.create(payload);
  return res.status(201).json(created);
};

exports.updateCertificate = async (req, res) => {
  const existing = await Certificate.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const update = {
    ...(req.body.name !== undefined && { name: normalizeString(req.body.name, 300) }),
    ...(req.body.issuingOrganization !== undefined && { issuingOrganization: normalizeString(req.body.issuingOrganization, 300) }),
    ...(req.body.issueDate !== undefined && { issueDate: parseDate(req.body.issueDate) }),
    ...(req.body.verificationLink !== undefined && { verificationLink: normalizeString(req.body.verificationLink, 2048) }),
    ...(req.body.category !== undefined && { category: normalizeString(req.body.category, 30) }),
    ...(req.body.featuredOnHome !== undefined && { featuredOnHome: normalizeBoolean(req.body.featuredOnHome) }),
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

  const nextCategory = update.category ?? existing.category;
  const nextFeaturedOnHome =
    update.featuredOnHome !== undefined ? update.featuredOnHome : Boolean(existing.featuredOnHome);

  try {
    await assertCertificateFeaturedLimit({
      category: nextCategory,
      featuredOnHome: nextFeaturedOnHome,
      excludeId: req.params.id,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }

  const updated = await Certificate.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  return res.json(updated);
};
exports.deleteCertificate = deleteItem(Certificate);

exports.getHeroContent = async (req, res) => {
  const item = await HeroContent.findOne().lean();
  res.json(serializeHeroContent(item));
};

exports.updateHeroContent = async (req, res) => {
  const payload = {
    availabilityText: normalizeString(req.body.availabilityText, 160),
    roleTitles: normalizeList(req.body.roleTitles).slice(0, 10),
    summary: normalizeString(req.body.summary, 1200),
  };

  const updated = await HeroContent.findOneAndUpdate(
    {},
    payload,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json(serializeHeroContent(updated.toObject()));
};

exports.getIntroduction = async (req, res) => {
  const item = await Introduction.findOne().lean();
  res.json(serializeIntroduction(item));
};

exports.updateIntroduction = async (req, res) => {
  const highlights = Array.isArray(req.body.highlights)
    ? req.body.highlights.map((item, index) => ({
        title: normalizeString(item?.title, 120),
        detail: normalizeString(item?.detail, 240),
        iconKey: normalizeString(item?.iconKey, 50) || 'education',
        order: Number.isFinite(Number(item?.order)) ? Number(item.order) : index,
      }))
    : [];

  const payload = {
    introLabel: normalizeString(req.body.introLabel, 60) || 'Introduction',
    headingPrimary: normalizeString(req.body.headingPrimary, 160),
    headingAccent: normalizeString(req.body.headingAccent, 160),
    description: normalizeString(req.body.description, 2000),
    highlights: highlights.filter((item) => item.title || item.detail),
  };

  const updated = await Introduction.findOneAndUpdate(
    {},
    payload,
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json(serializeIntroduction(updated.toObject()));
};

exports.getSkills = getAll(Skill);
exports.updateSkills = async (req, res) => {
  const id = normalizeString(req.body.id, 100);
  const category = normalizeString(req.body.category, 100);
  const skillsList = normalizeList(req.body.skillsList);

  if (!category) {
    return res.status(400).json({ message: 'Category is required' });
  }

  if (id) {
    const duplicate = await Skill.findOne({ category, _id: { $ne: id } }).lean();
    if (duplicate) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }

    const updated = await Skill.findByIdAndUpdate(
      id,
      { category, skillsList },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json(updated);
  }

  const updated = await Skill.findOneAndUpdate(
    { category },
    { category, skillsList },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  return res.json(updated);
};
exports.deleteSkill = deleteItem(Skill);

exports.getExperience = async (req, res) => {
  const items = await Experience.find().sort(getModelSort(Experience)).lean();
  res.json(items.map(serializeExperience));
};
exports.addExperience = async (req, res) => {
  const companyName = normalizeString(req.body.companyName ?? req.body.company, 200);
  const jobTitle = normalizeString(req.body.jobTitle ?? req.body.role, 200);
  const currentlyWorking = normalizeBoolean(req.body.currentlyWorking);
  const startDate = parseDate(req.body.startDate);
  const endDate = currentlyWorking ? null : parseDate(req.body.endDate);
  const location = normalizeString(req.body.location, 200);
  const description = normalizeString(req.body.description, 5000);

  const payload = {
    companyName,
    jobTitle,
    currentlyWorking,
    startDate,
    endDate,
    location,
    description,
    // Persist old field names too so older records/components stay compatible.
    company: companyName,
    role: jobTitle,
    duration: buildExperienceDuration({ startDate, endDate, currentlyWorking }),
  };

  if (!payload.companyName || !payload.jobTitle || !payload.startDate) {
    return res.status(400).json({ message: 'Required experience fields are missing' });
  }

  if (!payload.currentlyWorking && !payload.endDate) {
    return res.status(400).json({ message: 'End date is required unless this is your current role' });
  }

  if (payload.endDate && payload.endDate < payload.startDate) {
    return res.status(400).json({ message: 'End date cannot be earlier than start date' });
  }

  const created = await Experience.create(payload);
  return res.status(201).json(created);
};

exports.updateExperience = async (req, res) => {
  const existing = await Experience.findById(req.params.id);
  if (!existing) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const companyName = normalizeString(
    req.body.companyName ?? req.body.company ?? existing.companyName ?? existing.company,
    200
  );
  const jobTitle = normalizeString(
    req.body.jobTitle ?? req.body.role ?? existing.jobTitle ?? existing.role,
    200
  );
  const currentlyWorking =
    req.body.currentlyWorking !== undefined
      ? normalizeBoolean(req.body.currentlyWorking)
      : Boolean(existing.currentlyWorking);
  const startDate = parseDate(req.body.startDate !== undefined ? req.body.startDate : existing.startDate);
  const endDate = currentlyWorking
    ? null
    : parseDate(req.body.endDate !== undefined ? req.body.endDate : existing.endDate);
  const location = normalizeString(
    req.body.location !== undefined ? req.body.location : existing.location,
    200
  );
  const description = normalizeString(
    req.body.description !== undefined ? req.body.description : existing.description,
    5000
  );

  if (!companyName || !jobTitle || !startDate) {
    return res.status(400).json({ message: 'Required experience fields are missing' });
  }

  if (!currentlyWorking && !endDate) {
    return res.status(400).json({ message: 'End date is required unless this is your current role' });
  }

  if (endDate && endDate < startDate) {
    return res.status(400).json({ message: 'End date cannot be earlier than start date' });
  }

  const update = {
    companyName,
    jobTitle,
    currentlyWorking,
    startDate,
    endDate,
    location,
    description,
    company: companyName,
    role: jobTitle,
    duration: buildExperienceDuration({ startDate, endDate, currentlyWorking }),
  };

  Object.assign(existing, update);
  await existing.save();

  return res.json(existing);
};
exports.deleteExperience = deleteItem(Experience);

exports.getEducation = getAll(Education);
exports.addEducation = async (req, res) => {
  const payload = {
    degree: normalizeString(req.body.degree, 200),
    institution: normalizeString(req.body.institution, 200),
    grade: normalizeString(req.body.grade, 100),
    year: normalizeString(req.body.year, 50),
  };

  if (!payload.degree || !payload.institution || !payload.year) {
    return res.status(400).json({ message: 'Degree, institution, and year are required' });
  }

  const created = await Education.create(payload);
  return res.status(201).json(created);
};

exports.updateEducation = async (req, res) => {
  const update = {
    ...(req.body.degree !== undefined && { degree: normalizeString(req.body.degree, 200) }),
    ...(req.body.institution !== undefined && { institution: normalizeString(req.body.institution, 200) }),
    ...(req.body.grade !== undefined && { grade: normalizeString(req.body.grade, 100) }),
    ...(req.body.year !== undefined && { year: normalizeString(req.body.year, 50) }),
  };

  const updated = await Education.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!updated) {
    return res.status(404).json({ message: 'Item not found' });
  }

  return res.json(updated);
};
exports.deleteEducation = deleteItem(Education);

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
