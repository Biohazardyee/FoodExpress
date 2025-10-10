import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const uri = process.env.MONGO_DB || "";

export async function connectDB() {
    try {
        await mongoose.connect(uri, {
            serverApi: {
                version: "1",
                strict: true,
                deprecationErrors: true,
            },
        });

        console.log("✅ Connecté à MongoDB Atlas !");
    } catch (err) {
        console.error("❌ Erreur de connexion MongoDB :", err);
        process.exit(1);
    }
}
