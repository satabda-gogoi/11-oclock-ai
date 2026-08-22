// models/MasterApp.js
import mongoose from 'mongoose';

const MasterAppSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, 
  iconKey: { type: String, required: true, unique: true },            
  isActive: { type: Boolean, default: true },
  requiredFields: [
    {
      key: { type: String, required: true },         
      label: { type: String, required: true },       
      placeholder: { type: String },                 
      type: { type: String, default: "text" }        
    }
  ]
}, { timestamps: true });

// 💡 PRODUCTION INDEXES: Speeds up app validation checks and active catalog mapping loops
MasterAppSchema.index({ isActive: 1 });

export default mongoose.model('MasterApp', MasterAppSchema);