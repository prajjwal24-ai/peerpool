import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import poolRoutes from './routes/poolRoutes.js';

dotenv.config(); // enviroment variable load ho jayege 
connectDB(); // Datbase connect krne ke liye 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/pools', poolRoutes);

app.get('/',(req,res)=>{
    res.json({ success: true, message: 'PeerPool API is running smoothly!' });
})

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`server is listining on ${PORT}`);
});
