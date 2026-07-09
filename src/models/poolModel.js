import mongoose from 'mongoose';
import { timeStamp } from 'node:console';
const poolSchema = new mongoose.Schema(
    {
        title:{
            type: String,
            required: [true, 'Pool title is required'],
            trim: true,
            maxlength: [50, 'Title cannot be more than 50 characters']
        },
        description:{
            type: String,
            required: [true, 'Pool description is required'],
            maxlength : [200 , 'Description cannot more than 200 characters']
        },
    },
    {
        timeStamps : true
    })
const Pool = mongoose.model('Pool', poolSchema);
export default Pool;