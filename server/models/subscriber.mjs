import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /.+\@.+\..+/,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    lastNotifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

subscriberSchema.index({ email: 1 }, { unique: true });

const Subscriber = mongoose.model("Subscriber", subscriberSchema);

export default Subscriber;
