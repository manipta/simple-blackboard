import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Capacitor } from "@capacitor/core";
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdOptions, RewardAdPluginEvents } from "@capacitor-community/admob";
import { REWARD_AD_FREE_TIME_SECONDS, ADMOB_REWARDED_AD_ID, ADMOB_BANNER_AD_ID } from "../../constants";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

// Create the context
const AdsSettingsContext = createContext({
  adsEnabled: true,
  adFreeTimeLeft: 0 as number,
  setAdFreeTimeLeft: ((_: number) => { }) as any,
  startTimer: () => { },
  stopTimer: () => { },
  resetTimer: () => { },
  showRewardedAd: async () => { },
});

// Custom hook to use the AdsSettingsContext
export const useAdsSettings = () => {
  const context = useContext(AdsSettingsContext);
  if (!context) {
    throw new Error(
      "useAdsSettings must be used within an AdsSettingsProvider"
    );
  }
  return context;
};

// AdsSettingsProvider component
const AdsSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [adsEnabled] = useState(true); // Example state
  const [adFreeTimeLeft, setAdFreeTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAdMobInitialized, setIsAdMobInitialized] = useState(false);
  useEffect(() => {
    const initializeAds = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await AdMob.initialize({});
          console.log("AdMob initialized");
          setIsAdMobInitialized(true);
        } catch (e) {
          console.error("AdMob init error", e);
        }
      }
    };
    initializeAds();

    const loadAdFreeTime = async () => {
      const savedTime = await SecureStorage.get("adFreeTime");
      if (savedTime && savedTime.toString()) {
        const time = parseInt(savedTime.toString(), 10);
        setAdFreeTimeLeft(time);
        if (time > 0) {
          setIsTimerActive(true);
        }
      }
    };
    loadAdFreeTime();
  }, []);

  // Save the remaining time to persistent storage whenever it changes
  useEffect(() => {
    SecureStorage.set("adFreeTime", adFreeTimeLeft.toString());
  }, [adFreeTimeLeft]);

  // Start the timer
  const startTimer = () => {
    setIsTimerActive(true);
  };

  useEffect(() => {
    let intervalId: any;
    if (isTimerActive && adFreeTimeLeft > 0) {
      intervalId = setInterval(() => {
        setAdFreeTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerActive, adFreeTimeLeft]);

  // Stop the timer
  const stopTimer = () => {
    setIsTimerActive(false);
  };

  // Reset the timer
  const resetTimer = () => {
    setAdFreeTimeLeft(0);
    setIsTimerActive(false);
  };

  const showRewardedAd = async () => {
    if (!Capacitor.isNativePlatform()) {
      alert(`Ads only work on native devices. We will grant you ${REWARD_AD_FREE_TIME_SECONDS} seconds of ad-free time anyway for testing!`);
      setAdFreeTimeLeft((prev) => prev + REWARD_AD_FREE_TIME_SECONDS);
      startTimer();
      return;
    }

    try {
      const options: RewardAdOptions = {
        adId: ADMOB_REWARDED_AD_ID,
        isTesting: true,
      };

      await AdMob.prepareRewardVideoAd(options);

      let isRewarded = false;

      // Listen for reward (this only fires if the ad is fully watched)
      const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
        isRewarded = true;
        setAdFreeTimeLeft((prev) => prev + REWARD_AD_FREE_TIME_SECONDS);
        startTimer();
      });

      // Listen for ad dismissal to clean up listeners
      const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        if (!isRewarded) {
          alert("You closed the ad early, so the ad-free reward wasn't granted.");
        }
        // Cleanup listeners to prevent memory leaks and duplicate rewards
        rewardListener.remove();
        dismissListener.remove();
      });

      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error("Failed to show rewarded ad", e);
      alert("Failed to load ad. Please try again later.");
    }
  };

  // Banner logic
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || !isAdMobInitialized) return;

    const manageBanner = async () => {
      if (adFreeTimeLeft === 0) {
        try {
          const options: BannerAdOptions = {
            adId: ADMOB_BANNER_AD_ID,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.BOTTOM_CENTER,
            margin: 0,
            isTesting: true,
          };
          await AdMob.showBanner(options);
        } catch (e) {
          console.error("Banner error", e);
        }
      } else {
        try {
          await AdMob.hideBanner();
        } catch (e) {
          // Ignore hide errors
        }
      }
    };

    manageBanner();
  }, [adFreeTimeLeft, isAdMobInitialized]);

  return (
    <AdsSettingsContext.Provider
      value={{
        adsEnabled,
        adFreeTimeLeft,
        startTimer,
        stopTimer,
        resetTimer,
        setAdFreeTimeLeft,
        showRewardedAd,
      }}
    >
      {children}
    </AdsSettingsContext.Provider>
  );
};

export default AdsSettingsProvider;
