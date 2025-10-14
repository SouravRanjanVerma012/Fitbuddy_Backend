import express from 'express';
import { auth } from '../middleware/auth.js';
import User from '../models/User.js';
import WorkoutPlan from '../models/WorkoutPlan.js';

const router = express.Router();

// GET /api/recommendation - Get workout recommendations for today
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's workout plan
    const workoutPlan = await WorkoutPlan.findOne({ user: userId });
    
    if (!workoutPlan || !workoutPlan.plan) {
      return res.json({ 
        recommendation: null,
        message: 'No workout plan found. Create a plan to get recommendations.' 
      });
    }

    // Get today's day of the week
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const today = new Date();
    const getDayIndex = (date) => {
      const day = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
      return day === 0 ? 6 : day - 1;
    };
    const todayDay = daysOfWeek[getDayIndex(today)];
    
    // Get today's exercises from the workout plan
    const todayExercises = workoutPlan.plan[todayDay];
    
    if (!todayExercises || todayExercises.length === 0) {
      return res.json({ 
        recommendation: null,
        message: `No exercises planned for ${todayDay}. It might be a rest day.` 
      });
    }

    // Convert the workout plan format to recommendation format
    const recommendation = {
      exercises: todayExercises.map(exercise => ({
        name: exercise.name,
        sets: Array.from({ length: exercise.sets || 3 }, (_, index) => ({
          weight: 0, // Default weight, will be filled by user
          reps: exercise.reps || 10
        }))
      }))
    };

    res.json({ recommendation });
    
  } catch (error) {
    console.error('Error fetching recommendation:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendation',
      message: error.message 
    });
  }
});

// POST /api/recommendation/feedback - Submit feedback on recommendations
router.post('/feedback', auth, async (req, res) => {
  try {
    const { rating } = req.body; // 'easy', 'just_right', 'hard'
    const userId = req.user.id;
    
    // For now, just log the feedback
    // In a real app, you'd store this in a database and use it to improve recommendations
    console.log(`User ${userId} rated recommendation as: ${rating}`);
    
    res.json({ message: 'Feedback received successfully' });
    
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ 
      error: 'Failed to submit feedback',
      message: error.message 
    });
  }
});

export default router; 