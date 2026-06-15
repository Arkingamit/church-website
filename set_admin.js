const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://Graceapp:Graceapp%40123@grace.kbypufu.mongodb.net/grace-connect?retryWrites=true&w=majority&appName=GRACE';

async function run() {
  await mongoose.connect(MONGODB_URI);
  
  const users = await mongoose.connection.db.collection('users').find({}, { projection: { name: 1, email: 1, role: 1 } }).toArray();
  
  console.log(`\nTotal users: ${users.length}\n`);
  users.forEach(u => {
    console.log(`  ${u.role.padEnd(14)} | ${u.email.padEnd(35)} | ${u.name}`);
  });

  await mongoose.disconnect();
}

run().catch(e => { console.error('Error:', e.message); process.exit(1); });
