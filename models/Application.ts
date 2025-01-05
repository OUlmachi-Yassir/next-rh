import mongoose, { Schema, Document } from "mongoose";

interface IApplication extends Document {
  fullName: string;
  email: string;
  jobId: mongoose.Types.ObjectId; 
  userId?: mongoose.Types.ObjectId;
  cvPath: string;
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Job" },
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  cvPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Application ||
  mongoose.model<IApplication>("Application", ApplicationSchema);
