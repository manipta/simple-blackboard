import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { Capacitor } from "@capacitor/core";
import {
  AdMob,
  BannerAdOptions,
  BannerAdSize,
  BannerAdPosition,
  RewardAdOptions,
  RewardAdPluginEvents,
} from "@capacitor-community/admob";
import {
  REWARD_AD_FREE_TIME_SECONDS,
  ADMOB_REWARDED_AD_ID,
  ADMOB_BANNER_AD_ID,
} from "../../constants";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

export const AD_COOLDOWN_SECONDS = 1200; // 20 minute cooldown

// Create the context
const AdsSettingsContext = createContext({
  adsEnabled: true,
  adFreeTimeLeft: 0 as number,
  cooldownTimeLeft: 0 as number,
  setAdFreeTimeLeft: ((_: number) => { }) as any,
  startTimer: () => { },
  stopTimer: () => { },
  resetTimer: () => { },
  showRewardedAd: async () => { },
  setForceHideBanner: ((_: boolean) => { }) as any,
});

// Custom hook to use the AdsSettingsContext
export const useAdsSettings = () => {
  const context = useContext(AdsSettingsContext);
  if (!context) {
    throw new Error(
      "useAdsSettings must be used within an AdsSettingsProvider",
    );
  }
  return context;
};

// AdsSettingsProvider component
const AdsSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [adsEnabled] = useState(true); // Example state
  const [adFreeTimeLeft, setAdFreeTimeLeft] = useState<number>(0);
  const [cooldownTimeLeft, setCooldownTimeLeft] = useState<number>(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isAdMobInitialized, setIsAdMobInitialized] = useState(false);
  const [forceHideBanner, setForceHideBanner] = useState(false);

  useEffect(() => {
    const initializeAds = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          await AdMob.initialize({});
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
      const savedCooldown = await SecureStorage.get("adCooldownTime");
      if (savedCooldown && savedCooldown.toString()) {
        const cooldown = parseInt(savedCooldown.toString(), 10);
        setCooldownTimeLeft(cooldown);
        if (cooldown > 0) {
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

  useEffect(() => {
    SecureStorage.set("adCooldownTime", cooldownTimeLeft.toString());
  }, [cooldownTimeLeft]);

  // Start the timer
  const startTimer = () => {
    setIsTimerActive(true);
  };

  useEffect(() => {
    let intervalId: any;
    if (isTimerActive) {
      intervalId = setInterval(() => {
        setAdFreeTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        setCooldownTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isTimerActive]);

  // Stop timer when both reach zero
  useEffect(() => {
    if (isTimerActive && adFreeTimeLeft === 0 && cooldownTimeLeft === 0) {
      setIsTimerActive(false);
    }
  }, [adFreeTimeLeft, cooldownTimeLeft, isTimerActive]);

  // Stop the timer
  const stopTimer = () => {
    setIsTimerActive(false);
  };

  // Reset the timer
  const resetTimer = () => {
    setAdFreeTimeLeft(0);
    setCooldownTimeLeft(0);
    setIsTimerActive(false);
  };

  const formatTimeString = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0 && s > 0) return `${m} minutes and ${s} seconds`;
    if (m > 0) return `${m} minutes`;
    return `${s} seconds`;
  };

  const showRewardedAd = async () => {
    if (cooldownTimeLeft > 0) {
      alert(`Please wait ${formatTimeString(cooldownTimeLeft)} before watching another ad.`);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      alert(
        `Ads only work on native devices. We will grant you ${formatTimeString(REWARD_AD_FREE_TIME_SECONDS)} of ad-free time anyway for testing!`,
      );
      setAdFreeTimeLeft((prev) => prev + REWARD_AD_FREE_TIME_SECONDS);
      setCooldownTimeLeft(AD_COOLDOWN_SECONDS);
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
      const rewardListener = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        () => {
          isRewarded = true;
          setAdFreeTimeLeft((prev) => prev + REWARD_AD_FREE_TIME_SECONDS);
        },
      );

      // Listen for ad dismissal to clean up listeners and apply cooldown
      const dismissListener = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          if (!isRewarded) {
            alert(
              "You closed the ad early, so the ad-free reward wasn't granted.",
            );
          }

          // Apply cooldown regardless of success to prevent spamming
          setCooldownTimeLeft(AD_COOLDOWN_SECONDS);
          startTimer();

          // Cleanup listeners to prevent memory leaks and duplicate rewards
          rewardListener.remove();
          dismissListener.remove();
        },
      );

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
      if (adFreeTimeLeft === 0 && !forceHideBanner) {
        try {
          // Remove any existing banner first to avoid duplicate-banner errors
          try {
            await AdMob.removeBanner();
          } catch (_) {
            /* ignore */
          }
          const options: BannerAdOptions = {
            adId: ADMOB_BANNER_AD_ID,
            adSize: BannerAdSize.BANNER,
            position: BannerAdPosition.TOP_CENTER,
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
  }, [adFreeTimeLeft, isAdMobInitialized, forceHideBanner]);

  return (
    <AdsSettingsContext.Provider
      value={{
        adsEnabled,
        adFreeTimeLeft,
        cooldownTimeLeft,
        startTimer,
        stopTimer,
        resetTimer,
        setAdFreeTimeLeft,
        showRewardedAd,
        setForceHideBanner,
      }}
    >
      {children}
    </AdsSettingsContext.Provider>
  );
};

export default AdsSettingsProvider;
