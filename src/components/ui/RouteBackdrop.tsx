import "@dotlottie/react-player";
import { DotLottiePlayer } from "@dotlottie/react-player";
import "./RouteBackdrop.scss";

const RouteBackdrop = () => {
  return (
    <div className="route-backdrop flex flex-col justify-center items-center min-h-[60vh]">
      <div>
        <DotLottiePlayer
          autoplay
          loop
          src="/assets/lottie-files/astro_meditating.lottie"
          style={{
            height: "150px",
          }}
        />
      </div>
      <div className="flex items-center mt-12">
        {/* <Spinner />
        <span className="ml-4 text-2xl">Please wait...</span> */}
        <div className="w-36 h-2 rounded bg-gray-300 relative">
          <div className="load-bar h-2 rounded bg-blue-500" />
        </div>
      </div>
    </div>
  );
};

export default RouteBackdrop;
