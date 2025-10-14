const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/fitforge', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...');
    
    const users = await User.find({}, 'name email role');
    console.log(`\n📊 Found ${users.length} users in database:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Name: ${user.name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log('');
    });
    
    // Test login for each user
    console.log('🧪 Testing login for each user...');
    for (const user of users) {
      try {
        // Try common passwords
        const passwords = ['password123', 'admin123', 'coach123', 'user123'];
        
        for (const password of passwords) {
          const isMatch = await user.comparePassword(password);
          if (isMatch) {
            console.log(`✅ ${user.email} - Password: ${password}`);
            break;
          }
        }
      } catch (error) {
        console.log(`❌ Error testing ${user.email}:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkUsers(); 