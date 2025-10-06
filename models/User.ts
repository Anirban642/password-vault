import mongoose, { Schema, Document } from 'mongoose';

// Define interface for TypeScript type safety
interface IUser extends Document {
  email: string;
  password: string;
}

// Define the schema
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Export the model, checking if it already exists to prevent overwrite
export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);