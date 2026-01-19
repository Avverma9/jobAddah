import mongoose from "mongoose";

const menuItemSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    label: { type: String, required: true },
    route: { type: String, default: "" },
    icon: { type: String, default: null },
    iconType: {
      type: String,
      enum: ["font", "svg", "img", "none"],
      default: "font",
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },
    order: { type: Number, default: 0 },
    isPublic: { type: Boolean, default: false },
    badge: { type: String, default: null },
    meta: { type: Object, default: {} },
    permission: { type: String, default: null },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
