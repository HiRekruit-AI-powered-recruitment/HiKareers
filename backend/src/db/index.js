import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.utils.js";

export const connectDB = async (mongoUri) => {
    console.log("Connecting to database...");
    const dbUrl = mongoUri || process.env.DB_URL;
    console.log("Database URL:", dbUrl);
    if (!dbUrl) {
        console.error("Database URL is not defined in environment variables");
        process.exit(1);
    }

    try {
        await mongoose.connect(dbUrl, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Force IPv4 to resolve Windows TLS issues
        });
        console.log("Database connected successfully");
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1);
    }
}

export default connectDB;
