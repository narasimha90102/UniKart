const express = require('express');
const { 
  getUsers, 
  updateUserStatus, 
  getAllProducts, 
  getLoginHistory,
  getSupportRequests,
  respondToSupport,
  createUser,
  updateUser,
  deleteUser,
  getPendingVerifications,
  handleVerification
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/products', getAllProducts);
router.get('/login-history', getLoginHistory);
router.get('/support', getSupportRequests);
router.put('/support/:id', respondToSupport);
router.get('/verifications/pending', getPendingVerifications);
router.put('/verifications/:id', handleVerification);

module.exports = router;
