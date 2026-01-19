import axios from "axios";

const clearNextJsCache = async () => {
  try {
    await axios.post(
      `${process.env.NEXTJS_APP_URL || "https://jobsaddah.com"}/api/admin/clear-cache`,
      {},
      { timeout: 5000 }
    );

    return { success: true };
  } catch {
    return { success: false };
  }
};

export { clearNextJsCache };
