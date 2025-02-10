const express = require('express');
const { registerUser, loginUser,sendVerification,verificatinResult,verificationToken,validateToken,userdetails,updateUser} = require('../controllers/userController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post("/sendverification",sendVerification);
router.post("/poll-verification",verificatinResult);
router.get("/verify/:token",verificationToken);
router.post("/validate-token",validateToken);

router.get('/profile', authenticateToken, (req, res) => {
  res.status(200).json({ message: `Welcome, User ID: ${req.user.id}` });
});
router.get('/user-details', authenticateToken,userdetails);
router.put('/update-user', authenticateToken,updateUser);
module.exports = router;
