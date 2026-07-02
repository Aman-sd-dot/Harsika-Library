const Plan = require('../models/planModel');

// @desc    Get all active plans (Public/Students)
// @route   GET /api/plans
// @access  Public
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all plans including inactive (Admin)
// @route   GET /api/plans/all
// @access  Private/Admin
const getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find({});
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a membership plan
// @route   POST /api/plans
// @access  Private/Admin
const createPlan = async (req, res) => {
  const { planName, duration, price, description } = req.body;

  if (!planName || !duration || !price) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const plan = await Plan.create({
      planName,
      duration,
      price,
      description,
    });
    res.status(201).json(plan);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a membership plan
// @route   PUT /api/plans/:id
// @access  Private/Admin
const updatePlan = async (req, res) => {
  const { planName, duration, price, description, isActive } = req.body;

  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      plan.planName = planName !== undefined ? planName : plan.planName;
      plan.duration = duration !== undefined ? duration : plan.duration;
      plan.price = price !== undefined ? price : plan.price;
      plan.description = description !== undefined ? description : plan.description;
      plan.isActive = isActive !== undefined ? isActive : plan.isActive;

      const updatedPlan = await plan.save();
      res.json(updatedPlan);
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a membership plan
// @route   DELETE /api/plans/:id
// @access  Private/Admin
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (plan) {
      await Plan.deleteOne({ _id: plan._id });
      res.json({ message: 'Plan removed successfully' });
    } else {
      res.status(404).json({ message: 'Plan not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getPlans,
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan,
};
