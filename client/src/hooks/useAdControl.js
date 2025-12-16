import { useEffect, useState } from "react";
import axios from "axios";
import { baseUrl } from "../util/baseUrl";

const PUBLISHER_ID = "ca-pub-5390089359360512";

export default function useAdControl(pageType, slot) {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await axios.get(`${baseUrl}/ad-config`, {
          headers: {
            "X-Publisher-ID": PUBLISHER_ID,
          },
        });

        const config = res.data;

        // MASTER CHECK
        if (!config.adsEnabled) return setAllowed(false);
        if (!config.globalSettings?.showAds) return setAllowed(false);

        // PAGE CHECK
        if (pageType) {
          const page = config.pageSettings?.[pageType];
          if (page && !page.enabled) return setAllowed(false);
        }

        // SLOT CHECK
        if (slot) {
          const slotConfig = config.adSlots?.[slot];
          if (slotConfig && !slotConfig.enabled)
            return setAllowed(false);
        }

        setAllowed(true);
      } catch {
        setAllowed(false);
      }
    };

    fetchConfig();
  }, [pageType, slot]);

  return allowed;
}
