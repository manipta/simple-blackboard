import { useNavigate } from "react-router-dom";

const Error404Component = () => {
  const navigate = useNavigate();
  return (
    <div className="w-full">
      <img
        src="/assets/images/error.svg"
        className="m-auto mt-32 max-h-[320px] max-w-[72vw] cursor-pointer"
        onClick={() => navigate("/")}
      />
      <div
        className="text-2xl cursor-pointer text-blue-900 font-bold my-12 outline w-fit m-auto px-2 py-1 rounded"
        onClick={() => navigate("/")}
      >
        Go Back
      </div>
    </div>
  );
};

export default Error404Component;
