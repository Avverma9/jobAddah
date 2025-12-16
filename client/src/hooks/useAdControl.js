import { useEffect, useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdConfig } from '../../redux/slices/adConfigSlice';

const PUBLISHER_ID = "ca-pub-5390089359360512";

export default function useAdControl(pageType, slot) {
  const [allowed, setAllowed] = useState(false);
  const dispatch = useDispatch();
  const config = useSelector((s) => s.adConfig?.config);

  // Fetch ad-config once on mount
  useEffect(() => {
    dispatch(fetchAdConfig(PUBLISHER_ID));
  }, [dispatch]);

  // Re-evaluate permissions when config, pageType or slot changes
  useEffect(() => {
    try {
      if (!config) return setAllowed(false);

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
        if (slotConfig && !slotConfig.enabled) return setAllowed(false);
      }

      setAllowed(true);
    } catch {
      setAllowed(false);
    }
  }, [config, pageType, slot]);

  return allowed;
}
