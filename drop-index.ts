import mongoose from 'mongoose';
import * as fs from 'fs';

async function main() {
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const uriMatch = envFile.match(/MONGODB_URI=(.*)/);
  const uri = uriMatch ? uriMatch[1] : null;
  if (!uri) throw new Error('No MONGODB_URI found in .env.local');
  
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  
  try {
    await mongoose.connection.db?.collection('users').dropIndex('email_1');
    console.log('Successfully dropped email_1 index');
  } catch (err: any) {
    if (err.code === 27) {
      console.log('Index email_1 does not exist, nothing to do.');
    } else {
      console.error('Error dropping index:', err);
    }
  }
  
  await mongoose.disconnect();
}

main();
