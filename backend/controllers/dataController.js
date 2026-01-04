const Project = require('../models/Project');
const Research = require('../models/Research');
const Message = require('../models/Message');
const nodemailer = require('nodemailer');

// --- EMAIL TRANSPORTER CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- PROJECTS ---
const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (project) {
      await project.deleteOne();
      res.json({ message: 'Project removed' });
    } else {
      res.status(404).json({ message: 'Project not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- RESEARCH ---
const getResearch = async (req, res) => {
  try {
    const research = await Research.find().sort({ createdAt: -1 });
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addResearch = async (req, res) => {
  try {
    const research = await Research.create(req.body);
    res.status(201).json(research);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- MESSAGES & EMAIL SYSTEM ---
const sendMessage = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // 1. Save message to MongoDB
    const newMessage = await Message.create({ name, email, message });

    // 2. Setup Email Content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_RECEIVER,
      subject: `Portfolio: New Message from ${name}`,
      html: `
        <div style="font-family: sans-serif; border: 1px solid #eee; padding: 20px;">
          <h2 style="color: #ec4899;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background: #f9f9f9; padding: 15px;">${message}</p>
          <hr />
          <p style="font-size: 12px; color: #888;">This email was sent from your MERN Portfolio Server.</p>
        </div>
      `,
    };

    // 3. Send the Email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ success: true, data: newMessage });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    // Even if email fails, we saved the message in the DB
    res.status(500).json({ 
      success: false, 
      message: "Message saved to DB, but email notification failed.",
      error: error.message 
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  addProject,
  deleteProject,
  getResearch,
  addResearch,
  sendMessage,
  getMessages,
};