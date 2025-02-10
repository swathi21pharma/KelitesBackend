const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { log } = require('console');
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
    const { name, email, phone, password, isgauth } = req.body;
    
    const existingUser = await userModel.getUserByEmail(email);
   
    if (existingUser) {
      const userId1=existingUser.id;
      const email1=existingUser.email
      const token1 = jwt.sign({ id: userId1, email:email1 }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRY,
      });
      return res.status(isgauth ? 200 : 400).json({
        data: existingUser.id,
        error: 'Email already registered',
        token:isgauth ?token1:null
      });
    }

    const hashedPassword = password ? password : null;
    const userId = await userModel.createUser({ name, email, phone, password: hashedPassword });
    
    // Generate JWT Token for verification or session
    const token = jwt.sign(
      { id:userId.insertId, email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token:  token
    });
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

    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRY,
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const validateToken = (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    res.status(200).json({ user });
  });
};
const userdetails= async (req, res) => {
  try {
    const userId = req.user.id;
   
    const user = await userModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({
      id: user[0].id,
      name: user[0].name,
      email: user[0].email,
      phone: user[0].phone,
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

const updateUser= async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    // Fetch the existing user details
    const existingUser = await userModel.getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prepare updated fields
    const updatedFields = {
      name: name || existingUser.name,
      email: email || existingUser.email,
      phone: phone || existingUser.phone,
    };

  
    // Update the user in the database
    const updatedUser = await userModel.updateUserById(userId, updatedFields);

    res.status(200).json({
      message: 'User details updated successfully',
      user: {
        id: updatedUser[0].id,
        name: updatedUser[0].name,
        email: updatedUser[0].email,
        phone: updatedUser[0].phone,
        createdAt: updatedUser[0].createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { registerUser, loginUser,sendVerification,verificationToken,verificatinResult,validateToken,userdetails,updateUser};
