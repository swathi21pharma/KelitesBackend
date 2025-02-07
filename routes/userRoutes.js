const express = require('express');
const { registerUser, loginUser,sendVerification,verificatinResult,verificationToken } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/sendverification",sendVerification);
router.post("/poll-verification",verificatinResult);
router.get("/verify/:token",verificationToken);

router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome, User ID: ${req.user.id}` });
});

module.exports = router;
