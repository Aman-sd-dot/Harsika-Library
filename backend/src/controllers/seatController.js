const Seat = require('../models/seatModel');
const User = require('../models/userModel');
const Plan = require('../models/planModel');
const Notification = require('../models/notificationModel');

// @desc    Get all seats
// @route   GET /api/seats
// @access  Private
const getSeats = async (req, res) => {
  try {
    const seats = await Seat.find({})
      .populate('morning.student', 'name email phone studentId')
      .populate('evening.student', 'name email phone studentId')
      .populate('fullTime.student', 'name email phone studentId');
    res.json(seats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a seat
// @route   POST /api/seats
// @access  Private/Admin
const createSeat = async (req, res) => {
  const { seatNumber, floor, room, shift } = req.body;

  if (!seatNumber || !floor || !room) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const seatExists = await Seat.findOne({ seatNumber });

    if (seatExists) {
      return res.status(400).json({ message: 'Seat number already exists' });
    }

    const seat = await Seat.create({
      seatNumber,
      floor,
      room,
      status: 'available',
      morning: { student: null, assignedDate: null, expiryDate: null },
      evening: { student: null, assignedDate: null, expiryDate: null },
      fullTime: { student: null, assignedDate: null, expiryDate: null },
    });

    res.status(201).json(seat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a seat
// @route   PUT /api/seats/:id
// @access  Private/Admin
const updateSeat = async (req, res) => {
  const { seatNumber, floor, room, status } = req.body;

  try {
    const seat = await Seat.findById(req.params.id);

    if (seat) {
      seat.seatNumber = seatNumber || seat.seatNumber;
      seat.floor = floor || seat.floor;
      seat.room = room || seat.room;
      seat.status = status || seat.status;

      const updatedSeat = await seat.save();
      res.json(updatedSeat);
    } else {
      res.status(404).json({ message: 'Seat not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a seat
// @route   DELETE /api/seats/:id
// @access  Private/Admin
const deleteSeat = async (req, res) => {
  try {
    const seat = await Seat.findById(req.params.id);

    if (seat) {
      if (seat.status === 'occupied') {
        return res.status(400).json({ message: 'Cannot delete an occupied seat. Vacate it first.' });
      }
      await Seat.deleteOne({ _id: seat._id });
      res.json({ message: 'Seat removed successfully' });
    } else {
      res.status(404).json({ message: 'Seat not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Submit a seat request
// @route   POST /api/seats/request
// @access  Private/Student
const requestSeat = async (req, res) => {
  const { preferredFloor, preferredRoom, planId } = req.body;

  if (!planId) {
    return res.status(400).json({ message: 'Please select a membership plan' });
  }

  try {
    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(404).json({ message: 'Active plan not found' });
    }

    const student = await User.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student profile not found' });
    }

    if (student.assignedSeat) {
      return res.status(400).json({ message: 'You already have an assigned seat' });
    }

    student.seatRequest = {
      status: 'pending',
      preferredFloor: preferredFloor || 'Any',
      preferredRoom: preferredRoom || 'Any',
      plan: planId,
      requestDate: new Date(),
    };

    await student.save();

    // Create system notice for admin notification (broadcast/recipient mock logs)
    await Notification.create({
      title: 'New Seat Request',
      message: `${student.name} (${student.studentId}) requested a seat for plan "${plan.planName}".`,
      type: 'system',
    });

    res.json({ message: 'Seat request submitted successfully', seatRequest: student.seatRequest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Assign a seat to a student (Admin)
// @route   POST /api/seats/assign
// @access  Private/Admin
const assignSeat = async (req, res) => {
  const { seatId, studentId, planId, months, shift } = req.body;

  const targetShift = shift || 'fullTime'; // 'morning', 'evening', 'fullTime'

  if (!seatId || !studentId) {
    return res.status(400).json({ message: 'Seat ID and Student ID are required' });
  }

  try {
    const seat = await Seat.findById(seatId);
    const student = await User.findById(studentId);

    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (seat.status === 'maintenance') {
      return res.status(400).json({ message: 'Seat is under maintenance' });
    }

    // Check if slot is occupied or blocked by fullTime
    if (targetShift === 'morning') {
      if (seat.morning?.student || seat.fullTime?.student) {
        return res.status(400).json({ message: 'Seat is not available for Morning shift' });
      }
    } else if (targetShift === 'evening') {
      if (seat.evening?.student || seat.fullTime?.student) {
        return res.status(400).json({ message: 'Seat is not available for Evening shift' });
      }
    } else if (targetShift === 'fullTime') {
      if (
        seat.morning?.student ||
        seat.evening?.student ||
        seat.fullTime?.student
      ) {
        return res.status(400).json({ message: 'Seat is not available for Full-Time (shift slots are already occupied)' });
      }
    } else {
      return res.status(400).json({ message: 'Invalid shift selection' });
    }

    if (student.assignedSeat) {
      return res.status(400).json({ message: 'Student already has an assigned seat' });
    }

    // Determine plan and duration
    let durationMonths = months || 1;
    if (planId) {
      const plan = await Plan.findById(planId);
      if (plan) {
        durationMonths = plan.duration;
      }
    }

    // Calculate expiry dates
    const assignedDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);

    // Update Seat Slot
    seat[targetShift] = {
      student: studentId,
      assignedDate,
      expiryDate,
    };
    seat.status = 'occupied';
    await seat.save();

    // Update User
    student.assignedSeat = seatId;
    student.assignedShift = targetShift;
    student.seatRequest.status = 'approved';
    await student.save();

    // Notify Student
    await Notification.create({
      recipient: studentId,
      title: 'Seat Assigned',
      message: `Your request has been approved! Seat ${seat.seatNumber} (Floor: ${seat.floor}, Room: ${seat.room}) has been assigned to you for the ${targetShift} shift. Expiry: ${expiryDate.toLocaleDateString()}.`,
      type: 'system',
    });

    res.json({ message: 'Seat assigned successfully', seat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Vacate a seat slot (Admin)
// @route   POST /api/seats/vacate
// @access  Private/Admin
const vacateSeat = async (req, res) => {
  const { seatId, shift } = req.body;

  if (!seatId || !shift) {
    return res.status(400).json({ message: 'Seat ID and Shift Slot are required' });
  }

  try {
    const seat = await Seat.findById(seatId);

    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }

    const studentId = seat[shift]?.student;

    if (studentId) {
      const student = await User.findById(studentId);
      if (student) {
        student.assignedSeat = null;
        student.assignedShift = 'none';
        student.seatRequest.status = 'none'; // reset seat request
        await student.save();

        // Notify student
        await Notification.create({
          recipient: studentId,
          title: 'Seat Vacated',
          message: `Your assignment on Seat ${seat.seatNumber} (${shift} shift) has been vacated.`,
          type: 'system',
        });
      }
    }

    // Vacate the specific slot in DB
    seat[shift] = {
      student: null,
      assignedDate: null,
      expiryDate: null,
    };

    // Recalculate overall status
    if (
      (!seat.morning || !seat.morning.student) &&
      (!seat.evening || !seat.evening.student) &&
      (!seat.fullTime || !seat.fullTime.student)
    ) {
      seat.status = 'available';
    }
    await seat.save();

    res.json({ message: 'Seat slot vacated successfully', seat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getSeats,
  createSeat,
  updateSeat,
  deleteSeat,
  requestSeat,
  assignSeat,
  vacateSeat,
};
