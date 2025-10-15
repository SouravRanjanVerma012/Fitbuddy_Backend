import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.firebaseUid; // Password required only if not a Firebase user
    },
    minlength: 6
  },
  name: {
    type: String,
    required: function() {
      return !this.firebaseUid; // Name required only if not a Firebase user
    },
    trim: true
  },
  firebaseUid: {
    type: String,
    unique: true,
    sparse: true // Allows null values but enforces uniqueness for non-null
  },
  displayName: {
    type: String,
    trim: true
  },
  photoURL: {
    type: String
  },
  provider: {
    type: String,
    enum: ['google', 'github', 'facebook', 'twitter', 'email']
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'coach'],
    default: 'user'
  },
  profile: {
    age: Number,
    weight: Number,
    height: Number,
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    goals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'strength', 'endurance', 'flexibility', 'coaching']
    }],
    avatar: String
  },
  stats: {
    totalWorkouts: { type: Number, default: 0 },
    totalDuration: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastWorkoutDate: Date
  },
  preferences: {
    units: { type: String, enum: ['metric', 'imperial'], default: 'metric' },
    notifications: { type: Boolean, default: true },
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' }
  },
  settings: {
    // Notification & Reminder Settings
    workoutReminders: { type: Boolean, default: true },
    workoutReminderTime: { type: String, default: '18:00' },
    workoutReminderDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
    restDayReminders: { type: Boolean, default: true },
    restDayReminderTime: { type: String, default: '09:00' },
    progressCheckins: { type: Boolean, default: true },
    progressCheckinFrequency: { type: String, enum: ['weekly', 'monthly'], default: 'weekly' },
    formCheckReminders: { type: Boolean, default: true },
    formCheckReminderFrequency: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: 'weekly' },
    
    // Data & Privacy Settings
    autoSaveWorkouts: { type: Boolean, default: true },
    dataExportFormats: [{ type: String, enum: ['json', 'csv', 'pdf'] }],
    shareProgressWithFriends: { type: Boolean, default: true },
    shareProgressWithTrainer: { type: Boolean, default: false },
    cloudSync: { type: Boolean, default: true },
    backupFrequency: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'weekly' },
    
    // Privacy Controls
    showOnLeaderboard: { type: Boolean, default: true },
    receiveEmails: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true },
    profileVisibility: { type: String, enum: ['public', 'friends', 'private'], default: 'friends' }
  },
  macroSummaries: [{
    date: { type: Date, default: Date.now },
    period: { type: String, enum: ['weekly', 'monthly', 'quarterly'], required: true },
    summary: {
      totalWorkouts: Number,
      totalSets: Number,
      totalReps: Number,
      maxWeight: Number,
      avgWeight: Number,
      mostFrequentExercise: String,
      improvementRate: Number,
      consistency: Number
    },
    exercises: [{
      name: String,
      totalSets: Number,
      maxWeight: Number,
      maxReps: Number,
      improvement: Number
    }]
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema); 