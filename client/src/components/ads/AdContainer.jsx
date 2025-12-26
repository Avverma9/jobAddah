import SmartAdSense from "./SmartAdSense";
import { AD_SLOTS } from "../../util/AdConfig";
import useAdControl from "../../hooks/useAdControl";

// Map placement types to actual AdSense slot IDs
const getSlotId = (placement, pageType) => {
  const slotMap = {
    banner: {
      homepage: AD_SLOTS.HEADER_BANNER,
      jobDetail: AD_SLOTS.TOP_LEADERBOARD,
      categoryPages: AD_SLOTS.HEADER_BANNER,
      staticPages: AD_SLOTS.HEADER_BANNER,
      footer: AD_SLOTS.FOOTER_BANNER,
    },
    rectangle: {
      homepage: AD_SLOTS.HOME_RECTANGLE,
      jobDetail: AD_SLOTS.POST_RECTANGLE,
      categoryPages: AD_SLOTS.CONTENT_RECTANGLE,
      staticPages: AD_SLOTS.CONTACT_RECTANGLE,
    },
    inFeed: {
      homepage: AD_SLOTS.FEED_AD,
      categoryPages: AD_SLOTS.FEED_AD,
    },
    inArticle: {
      jobDetail: AD_SLOTS.IN_ARTICLE,
    },
  };

  return slotMap[placement]?.[pageType] || AD_SLOTS.CONTENT_RECTANGLE;
};

export default function AdContainer({
  pageType,
  placement,
  slotId,
  fallback = null,
  format = "auto",
  className = "",
}) {
  const canShow = useAdControl(pageType, placement);
  const actualSlotId = slotId || getSlotId(placement, pageType);

  if (!canShow) return fallback;

  return (
    <div className={`my-4 ${className}`}>
      <SmartAdSense slotId={actualSlotId} format={format} />
    </div>
  );
}
