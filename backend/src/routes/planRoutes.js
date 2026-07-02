const express = require('express');
const router = express.Router();
const {
  getPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/planController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

router.get('/', getPlans);
router.get('/all', protect, adminOnly, getAllPlans);
router.post('/', protect, adminOnly, createPlan);
router.put('/:id', protect, adminOnly, updatePlan);
router.delete('/:id', protect, adminOnly, deletePlan);

module.exports = router;
