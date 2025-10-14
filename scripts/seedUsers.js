import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('🧹 Cleared existing users');

    const testUsers = [
      {
        email: 'test@example.com',
        password: 'password123',
        name: 'Rahul Sharma',
        role: 'user',
        profile: {
          age: 25,
          weight: 70,
          height: 175,
          fitnessLevel: 'intermediate',
          goals: ['strength', 'muscle_gain']
        }
      },
      {
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Priya Patel',
        role: 'admin',
        profile: {
          age: 30,
          weight: 65,
          height: 165,
          fitnessLevel: 'advanced',
          goals: ['weight_loss', 'endurance']
        }
      },
      {
        email: 'coach@example.com',
        password: 'coach123',
        name: 'Coach Mike',
        role: 'coach',
        profile: {
          age: 35,
          weight: 80,
          height: 180,
          fitnessLevel: 'expert',
          goals: ['strength', 'coaching']
        }
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('\n Test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('User: test@example.com / password123');
    console.log('Admin: admin@example.com / admin123');
    console.log('Coach: coach@example.com / coach123');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

seedUsers(); 