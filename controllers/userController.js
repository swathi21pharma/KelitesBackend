const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
let verificationTokens = {}; 

const transporter = nodemailer.createTransport({
  host: "smtp.mailgun.org",
  port: 587,
  auth: {
    user: "postmaster@sandboxaa9292392f2b4f01a7eecde046fcc283.mailgun.org", // replace with your Mailgun username
    pass: "b94bafa63b5b593fa06dc0dbe9134f8e-667818f5-60b224e6", // replace with your Mailgun password
  },
});

const sendVerification = async (req, res) => {
  const { name, email } = req.body;

    console.log(name,email);

  // Generate a unique verification token
  const token = crypto.randomBytes(32).toString('hex');
  const expirationTime = Date.now() + 2 * 60 * 1000; // 2 minutes

  // Store token with expiration
  verificationTokens[token] = { email, expirationTime };

  const verificationLink = `${'http://localhost:5000'}/verify/${token}`;

  // Send verification email
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Verify Your Email',
      html: `
        <h3>Hi ${name},</h3>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>This link will expire in 2 minutes.</p>
      `,
    });

    res.status(200).json({ message: 'Verification email sent.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending verification email.' });
  } 
};

// Verify token and complete registration

const verificationToken=async (req, res) => {
  const { token } = req.params;

  if (!verificationTokens[token]) {
    return res.status(400).send('Invalid or expired token.');
  }

  const { email, expirationTime } = verificationTokens[token];

  if (Date.now() > expirationTime) {
    delete verificationTokens[token];
    return res.status(400).send('Verification link expired.');
  }

  // Complete user verification
  delete verificationTokens[token];
  res.status(200).send('Email verified successfully!');
};

// Long-polling for verification result
const verificatinResult= (req, res) => {
  const { token } = req.body;

  if (!verificationTokens[token]) {
    return res.status(400).json({ verified: false, message: 'Invalid or expired token.' });
  }

  const pollInterval = setInterval(() => {
    if (!verificationTokens[token]) {
      clearInterval(pollInterval);
      res.status(200).json({ verified: true, message: 'Email verified successfully!' });
    }
  }, 1000); 
};


const registerUser = async (req, res) => {
  try {
    const { id,name, email, phone, password } = req.body;

    const existingUser = await userModel.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userId = await userModel.createUser({ id,name, email, phone, password });
    res.status(201).json({ message: 'User registered successfully', userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};




const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser,sendVerification,verificationToken,verificatinResult};
