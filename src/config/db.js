import mongoose from "mongoose";

const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/peerpool');
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    }catch(error){
        console.log(`Error : ${error.message} `);
        process.mainModule
        process.exit(1);
    }

}
export default connectDB;
