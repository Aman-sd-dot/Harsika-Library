require('dotenv').config();
const mongoose = require("mongoose");
const dns = require('dns');

// Force Node.js to use Google DNS for SRV lookup
try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  dns.setDefaultResultOrder('ipv4first');
  console.log("Custom DNS servers configured successfully.");
} catch (e) {
  console.log("DNS configuration error:", e.message);
}

const uri = process.env.MONGO_URI;
console.log("Attempting connection to:", uri);

mongoose
  .connect(uri)
  .then(() => {
    console.log("✅ Connected successfully to MongoDB Atlas!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Connection failed!");
    console.error(err);
    process.exit(1);
  });