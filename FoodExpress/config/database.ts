import mongoose from "mongoose";

const uri = "mongodb+srv://noahgtours37_db_user:test@cluster0.rsiyghr.mongodb.net/maBase?retryWrites=true&w=majority&appName=Cluster0";

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
        process.exit(1); // Arrête l'app si la connexion échoue
    }
}
