import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";
import { useSettings } from "../../services/providers/SettingsProvider";

const SinglePage = ({
  pageData,
  index,
}: {
  pageData: string;
  index: number;
}) => {
  const { setCurrentPage, setShowPreview } = useCanvasDataProvider();
  const { boardConfig } = useSettings();

  return (
    <div
      className="group flex flex-col items-center bg-gray-800/40 backdrop-blur-md rounded-2xl border border-gray-700/50 shadow-lg w-[45%] max-w-[300px] min-w-[140px] overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-blue-500/20 hover:border-blue-500/50"
      onClick={() => {
        setCurrentPage(index);
        setShowPreview(false);
      }}
    >
      <div className="w-full aspect-[3/4] relative overflow-hidden bg-gray-900 border-b border-gray-700/50">
        {pageData ? (
          <div 
            className="w-full h-full absolute inset-0"
            style={
              boardConfig.type === "color"
                ? { background: boardConfig.board }
                : { background: `url(${boardConfig.board})`, backgroundSize: 'cover' }
            }
          >
            <img
              src={pageData}
              className="w-full h-full object-contain drop-shadow-md"
              alt={`Page ${index + 1}`}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800/50 text-gray-400 font-medium">
            Fresh Page
          </div>
        )}
        
        {/* Overlay effect on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
      </div>
      
      <div className="w-full p-3 bg-gray-800/80 backdrop-blur-sm flex items-center justify-center">
        <span className="text-sm font-bold tracking-wide text-gray-200">
          Page {index + 1}
        </span>
      </div>
    </div>
  );
};

export default SinglePage;
