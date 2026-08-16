require("dotenv").config({
  path: ".env.local",
});

const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
const readline = require("readline");

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing from .env.local");
  process.exit(1);
}

if (!MONGODB_DB) {
  console.error("❌ MONGODB_DB is missing from .env.local");
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function main() {
  let client;

  try {
    console.log("");
    console.log("=================================");
    console.log("   ETHIOPIA MAPS ADMIN PASSWORD");
    console.log("=================================");
    console.log("");

    const email = (
      await ask("Admin email: ")
    )
      .trim()
      .toLowerCase();

    if (!email) {
      throw new Error(
        "Admin email cannot be empty."
      );
    }

    const password = await ask(
      "New password: "
    );

    if (!password || password.length < 8) {
      throw new Error(
        "Password must be at least 8 characters."
      );
    }

    const confirmation =
      await ask(
        "Confirm new password: "
      );

    if (password !== confirmation) {
      throw new Error(
        "Passwords do not match."
      );
    }

    console.log("");
    console.log(
      "🔐 Hashing new password..."
    );

    const passwordHash =
      await bcrypt.hash(
        password,
        12
      );

    client =
      new MongoClient(
        MONGODB_URI
      );

    console.log(
      "🔌 Connecting to MongoDB..."
    );

    await client.connect();

    const db =
      client.db(MONGODB_DB);

    const admins =
      db.collection("admins");

    const admin =
      await admins.findOne({
        email,
      });

    if (!admin) {
      throw new Error(
        `No admin account found for ${email}.`
      );
    }

    await admins.updateOne(
      {
        _id: admin._id,
      },
      {
        $set: {
          passwordHash,
          updatedAt: new Date(),
        },
      }
    );

    console.log("");
    console.log(
      "================================="
    );
    console.log(
      "✅ PASSWORD CHANGED SUCCESSFULLY"
    );
    console.log(
      "================================="
    );
    console.log("");
    console.log(
      `Account: ${email}`
    );
    console.log("");
    console.log(
      "You can now log in with the new password."
    );
    console.log("");
  } catch (error) {
    console.error("");
    console.error(
      "❌ Password change failed."
    );
    console.error("");

    console.error(
      error instanceof Error
        ? error.message
        : error
    );

    console.error("");
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
    }

    rl.close();
  }
}

main();