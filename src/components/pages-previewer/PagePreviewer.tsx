import { IconButton } from "@mui/material";
import SinglePage from "./SinglePage";
import CancelIcon from "@mui/icons-material/Cancel";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";

const PagePreviewer = ({ pages }: { pages: string[] }) => {
  const { setShowPreview } = useCanvasDataProvider();
  return (
    <div className="flex flex-col w-full items-center gap-8">
      <div className={`fixed flex w-full justify-center bg-black p-2`}>
        <div className=" font-sans font-extrabold text-3xl">Previewer</div>
        <div className="fixed right-2">
          <IconButton
            onClick={() => {
              setShowPreview(false);
            }}
          >
            <CancelIcon fontSize="small" sx={{ color: "white" }} />
          </IconButton>
        </div>
      </div>
      <div className="flex flex-wrap max-w-[90%] min-w-[90%] gap-2 justify-center mt-16 p-4 ">
        {pages.map((page, index) => (
          <SinglePage pageData={page} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PagePreviewer;
