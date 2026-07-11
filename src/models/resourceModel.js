import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    poolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref : 'Pool',
        required: [true, 'Resource must belong to a Pool']
    },
    title: {
        type: String,
        required: [true, 'Resource title are required'],
        trim : true
    },
    type: {
        type : String,
        required: [true, 'Type is required'],
        enum: ['link','code']
    },
    content: {
        type: String,
        required : [true, 'Content is required']
    },
    sender: {
        type : String,
        default: 'Anonymous'
    }
},
{
    timestamps: true
})

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource; 
