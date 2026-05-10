import { MdCheck } from "react-icons/md";

const BgColorChoice = ({
  board,
  title,
  type,
  check = false,
  setBoardConfig,
}: {
  board: string;
  title: string;
  type: "image" | "color";
  check?: boolean;
  setBoardConfig: any;
}) => {
  return (
    <div
      className="flex flex-col w-full h-20 min-h-full"
      onClick={() => {
        setBoardConfig({ board: board, type: type, title: title });
      }}
    >
      <div
        className="flex-grow bg-cover bg-center border-4 border-[#BC8C5C] content-center place-items-center"
        style={
          type == "image"
            ? { backgroundImage: `url(${board})` }
            : { backgroundColor: board }
        }
      >
        {check && (
          <div>
            <MdCheck size={30} color="orange" />
          </div>
        )}
      </div>
      <div className="w-20 h-fit bg-black text-white text-center p-0.5">
        {title}
      </div>
    </div>
  );
};

export default BgColorChoice;
