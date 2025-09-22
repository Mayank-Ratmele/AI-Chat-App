import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// console.log(`Mongo_URI: ${'mongodb+srv://mayank:mayank%402004@cluster0.nsyayut.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'}`);

async function connect() {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri)
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch(err => {
        console.log(err);
    })
}

export default connect;