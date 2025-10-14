import mongoose from 'mongoose';

const healthDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  steps: {
    type: Number,
    default: 0
  },
  heartRate: {
    type: Number,
    min: 0,
    max: 300
  },
  calories: {
    type: Number,
    default: 0
  },
  distance: {
    type: Number,
    default: 0
  },
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  activeMinutes: {
    type: Number,
    default: 0
  },
  bloodOxygen: {
    type: Number,
    min: 0,
    max: 100
  },
  bloodPressure: {
    systolic: { type: Number, min: 0 },
    diastolic: { type: Number, min: 0 }
  },
  temperature: {
    type: Number,
    min: 30,
    max: 45
  },
  stressLevel: {
    type: Number,
    min: 0,
    max: 100
  },
  sleepStages: {
    deep: { type: Number, default: 0 },
    light: { type: Number, default: 0 },
    rem: { type: Number, default: 0 },
    awake: { type: Number, default: 0 }
  },
  workouts: [{
    type: {
      type: String,
      enum: ['cardio', 'strength', 'flexibility', 'sports']
    },
    duration: Number,
    calories: Number,
    intensity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  syncSessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SyncSession'
  },
  dataSource: {
    type: String,
    enum: ['bluetooth', 'manual', 'import'],
    default: 'bluetooth'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for unique health data per user, device, and date
healthDataSchema.index({ userId: 1, deviceId: 1, date: 1 }, { unique: true });

// Indexes for efficient queries
healthDataSchema.index({ userId: 1, date: -1 });
healthDataSchema.index({ deviceId: 1, date: -1 });
healthDataSchema.index({ syncSessionId: 1 });

export default mongoose.model('HealthData', healthDataSchema); 