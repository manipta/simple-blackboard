import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// import { Storage } from "@capacitor/storage";
import { SecureStorage } from "@aparajita/capacitor-secure-storage";

// Create the context
const AdsSettingsContext = createContext({
  adsEnabled: true,
  adFreeTimeLeft: 0 as number,
  setAdFreeTimeLeft: ((_: number) => {}) as any,
  startTimer: () => {},
  stopTimer: () => {},
  resetTimer: () => {},
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
  const [adFreeTimeLeft, setAdFreeTimeLeft] = useState<number>(5);
  const [isTimerActive, setIsTimerActive] = useState(false);
  console.log(SecureStorage.keys());
  // setAdsEnabled(false);
  // Load the remaining time from persistent storage (Capacitor Storage)
  useEffect(() => {
    const loadAdFreeTime = async () => {
      const savedTime = await SecureStorage.get("adFreeTime");
      if (savedTime && savedTime.toString()) {
        setAdFreeTimeLeft(parseInt(savedTime.toString(), 10));
      }
    };
    loadAdFreeTime();
  }, []);

  // Save the remaining time to persistent storage
  const saveAdFreeTime = async () => {
    await SecureStorage.set("adFreeTime", adFreeTimeLeft.toString());
  };

  // Start the timer
  const startTimer = () => {
    setIsTimerActive(true);
  };
  useEffect(() => {
    if (isTimerActive) {
      if (adFreeTimeLeft > 0 && isTimerActive) {
        const intervalId = setInterval(() => {
          console.log(isTimerActive);
          if (adFreeTimeLeft > 0 && isTimerActive) {
            setAdFreeTimeLeft((prev) => prev - 1);
            saveAdFreeTime(); // Persist the time on every second
          } else {
            clearInterval(intervalId); // Stop the interval when time is up
          }
        }, 1000);
      }
    }
  }, [isTimerActive]);

  // Stop the timer
  const stopTimer = () => {
    setIsTimerActive(false);
  };

  // Reset the timer
  const resetTimer = () => {
    setAdFreeTimeLeft(0);
    saveAdFreeTime(); // Persist the reset value
    setIsTimerActive(false);
  };

  return (
    <AdsSettingsContext.Provider
      value={{
        adsEnabled,
        adFreeTimeLeft,
        startTimer,
        stopTimer,
        resetTimer,
        setAdFreeTimeLeft,
      }}
    >
      {children}
    </AdsSettingsContext.Provider>
  );
};

export default AdsSettingsProvider;
