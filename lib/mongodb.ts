import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Please add MONGODB_URI to your .env.local file"
  );
}

console.log(
  "MongoDB URI hosts:",
  uri
    .replace(/\/\/.*@/, "//***@")
);

const client = new MongoClient(uri, {
  tls: true,
});

const clientPromise = client.connect();

export default clientPromise;

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise;
}