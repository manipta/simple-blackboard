import { MdPauseCircle, MdPlayCircle } from "react-icons/md";
import { useAdsSettings } from "../../services/providers/AdsSettingsProvider";
import { Button } from "@mui/material";

const AdFreeTimer = () => {
  const { adFreeTimeLeft, startTimer, stopTimer, resetTimer } =
    useAdsSettings();

  // Automatically start the timer when the component mounts (optional)

  return (
    <div>
      <div>
        <span className="mr-1">Time Available:</span>
        <span>{adFreeTimeLeft}</span>
      </div>
      <div>
        <Button
          onClick={startTimer}
          disabled={adFreeTimeLeft <= 0}
          className="w-fit m-1 p-0"
          sx={{ margin: "0", padding: "0" }}
        >
          <div>
            <MdPlayCircle size={40} />
          </div>
        </Button>
        <Button
          onClick={stopTimer}
          disabled={adFreeTimeLeft <= 0}
          className="w-fit m-1 p-0"
          sx={{ margin: "0", padding: "0" }}
        >
          <div>
            <MdPauseCircle size={40} />
          </div>
        </Button>
        <button onClick={resetTimer}>Get More Time!</button>
      </div>
    </div>
  );
};

export default AdFreeTimer;
