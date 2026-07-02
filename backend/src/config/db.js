const mongoose = require('mongoose');
const dns = require('dns');

// Force Node.js to use Google DNS for SRV lookup (resolves querySrv ECONNREFUSED on local systems)
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  console.log("DNS configuration skipped:", e.message);
}

let mongoServer;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGO_URI;

    // If database points to localhost/local IP or is empty, check availability and fallback if missing
    if (!dbUri || dbUri.includes('0.0.0.0/0') || dbUri.includes('localhost')) {
      try {
        const testUri = dbUri || 'mongodb://0.0.0.0/0/study-space';
        console.log(`🔄 Attempting connection to local MongoDB at: ${testUri}...`);
        
        // Fast selection check
        const conn = await mongoose.connect(testUri, {
          serverSelectionTimeoutMS: 2000,
        });
        console.log(`✅ MongoDB Connected to Local Instance: ${conn.connection.host}`);
        return;
      } catch (err) {
        console.log('⚠️ Local MongoDB service not active. Starting in-memory MongoDB Server fallback...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoServer = await MongoMemoryServer.create();
        dbUri = mongoServer.getUri();
        console.log(`🚀 In-memory MongoDB Server running at: ${dbUri}`);
      }
    }
console.log("========== MONGO_URI ==========");
console.log(process.env.MONGO_URI);
console.log("================================");
console.log("MONGO_URI =", process.env.MONGO_URI);
    const conn = await mongoose.connect(dbUri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  }catch (error) {
  console.error("❌ Full MongoDB Error:");
  console.error(error);
  process.exit(1);
}
};

module.exports = connectDB;
