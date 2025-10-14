import mongoose from 'mongoose';

const setSchema = new mongoose.Schema({
  weight: { type: Number, default: 0 },
  reps: { type: Number, required: true },
  completed: { type: Boolean, default: false },
  notes: String
});

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sets: [setSchema],
  targetSets: { type: Number, required: true },
  targetReps: { type: Number, required: false }, // Made optional to match frontend
  notes: String
});

const workoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  session: [exerciseSchema],
  duration: Number,
  calories: Number,
  notes: String,
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'mixed'],
    default: 'strength'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  }
}, {
  timestamps: true
});

export default mongoose.model('Workout', workoutSchema); 