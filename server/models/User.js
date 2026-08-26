import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, require: true},
    email: { type: String , require: true, unique: true},
    contactNumber: { type: String, default: "" },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" }
}, { timestamps: true });
// Export default instead of module.exports
export default mongoose.model('User', userSchema);
