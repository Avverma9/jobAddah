import Subscriber from "../models/subscriber.mjs";

const normalizeStatus = (status) => {
  if (!status) return undefined;
  const value = String(status).toLowerCase();
  return value === "active" || value === "inactive" ? value : undefined;
};

const subscribeUser = async (req, res) => {
  try {
    const { name, email, status } = req.body || {};

    if (!name || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedStatus = normalizeStatus(status) || "active";

    const existing = await Subscriber.findOne({ email: normalizedEmail });

    if (existing) {
      existing.name = name;
      existing.status = normalizedStatus;
      const updated = await existing.save();
      return res.json({
        success: true,
        message: "Subscriber updated",
        data: updated,
      });
    }

    const subscriber = await Subscriber.create({
      name,
      email: normalizedEmail,
      status: normalizedStatus,
    });

    return res
      .status(201)
      .json({ success: true, message: "Subscribed", data: subscriber });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already subscribed",
      });
    }

    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

const listSubscribers = async (_req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    return res.json({ success: true, count: subscribers.length, data: subscribers });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

const updateSubscriberStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'inactive'",
      });
    }

    const subscriber = await Subscriber.findByIdAndUpdate(
      req.params.id,
      { status: normalizedStatus },
      { new: true }
    );

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, data: subscriber });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

const deleteSubscriber = async (req, res) => {
  try {
    const subscriber = await Subscriber.findByIdAndDelete(req.params.id);

    if (!subscriber) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    return res.json({ success: true, message: "Subscriber deleted" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export {
  subscribeUser,
  listSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
};
