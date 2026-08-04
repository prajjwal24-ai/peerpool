import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
    {
        group:{
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Group',
            required: true,
        },
        sender:{
            type : mongoose.Schema.Types.ObjectId,
            ref:'User',
            required: true,
        },
        content:{
            type : String,
            default: '',
            required: true,
            trim: true,
        },
        messageType: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text',
    },
    fileUrl: {
      type: String,
      default: '', 
    },
    fileName: {
      type: String,
      default: '',
    },
    },
    {
        timestamps: true,
    }
);

const Message = mongoose.model('Message',messageSchema);
export default Message;