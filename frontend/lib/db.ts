import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

export const connect = async () => {
    const connectionState = mongoose.connection.readyState;

    if (connectionState === 1) {
        console.log("Already connected to MongoDB");
        return;
    }

    if (connectionState === 2) {
        console.log("connecting to MongoDB");
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI!, {
            dbName: "chatapp",
            bufferCommands: true,
        });
        console.log("Connected to MongoDB");
    } catch (error: any) {
        console.error("Error connecting to MongoDB:", error);
        throw new error(error);
    }
};