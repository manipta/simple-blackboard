import SinglePage from "./SinglePage";
import { MdClose } from "react-icons/md";
import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import { Icon } from "@mui/material";

const PagePreviewer = ({ pages }: { pages: string[] }) => {
  const { setShowPreview } = useCanvasDataProvider();

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-900 text-gray-100 items-center overflow-y-auto font-sans pb-12">
      {/* Header */}
      <div className="w-full flex items-center justify-between p-6 sticky top-0 bg-gray-900/80 backdrop-blur-xl z-20 border-b border-gray-800">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
          Page Overview
        </h1>
        <Icon onClick={() => setShowPreview(false)} className="cursor-pointer">
          <MdClose size={28} />
        </Icon>
      </div>

      <div className="flex flex-wrap w-full max-w-4xl gap-8 justify-center mt-8 px-6">
        {pages.map((page, index) => (
          <SinglePage key={index} pageData={page} index={index} />
        ))}
      </div>
    </div>
  );
};

export default PagePreviewer;
