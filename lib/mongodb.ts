import mongoose from "mongoose";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConn: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;
if (!MONGODB_URI) throw new Error("MONGODB_URI is not defined");

export async function connectMongo() {
  if (!global._mongooseConn) global._mongooseConn = { conn: null, promise: null };
  if (global._mongooseConn.conn) return global._mongooseConn.conn;
  if (!global._mongooseConn.promise) {
    global._mongooseConn.promise = mongoose
      .connect(MONGODB_URI, { dbName: "psyk", maxPoolSize: 5 })
      .then((m) => m);
  }
  global._mongooseConn.conn = await global._mongooseConn.promise;
  return global._mongooseConn.conn;
}
