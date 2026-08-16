import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

const uri = process.env.MONGODB_URI;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!uri) {
  throw new Error("MONGODB_URI is required.");
}

if (!adminEmail) {
  throw new Error("ADMIN_EMAIL is required.");
}

if (!adminPassword) {
  throw new Error("ADMIN_PASSWORD is required.");
}

const client = new MongoClient(uri);

async function createAdmin() {
  try {
    console.log("Connecting to MongoDB...");

    await client.connect();

    console.log("Connected to MongoDB.");

    const db = client.db();

    const admins = db.collection("admins");

    const existingAdmin = await admins.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log(
        `Admin ${adminEmail} already exists.`
      );

      return;
    }

    const passwordHash = await bcrypt.hash(
      adminPassword,
      12
    );

    await admins.insertOne({
      email: adminEmail,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("");
    console.log("================================");
    console.log(" ADMIN CREATED SUCCESSFULLY");
    console.log("================================");
    console.log(`Email: ${adminEmail}`);
    console.log("Password: ********");
    console.log("================================");
    console.log("");
  } catch (error) {
    console.error("");
    console.error("Failed to create admin:");
    console.error(error);
    console.error("");
    process.exit(1);
  } finally {
    await client.close();
  }
}

createAdmin();