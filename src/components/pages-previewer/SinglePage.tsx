import { useCanvasDataProvider } from "../../services/providers/CanvasDataProvider";

const SinglePage = ({
  pageData,
  index,
}: {
  pageData: string;
  index: number;
}) => {
  const { setCurrentPage, setShowPreview } = useCanvasDataProvider();
  return (
    <div
      className="flex flex-col gap-1 items-center border-white border w-[45%] min-w-36 "
      onClick={() => {
        setCurrentPage(index);
        setShowPreview(false);
      }}
    >
      {pageData ? (
        <img src={pageData} className="w-full h-full">
          {/* <img src={pageData}></img> */}
        </img>
      ) : (
        <div className=" min-h-72 w-full h-full items text-center content-center">
          Fresh Page
        </div>
      )}
      <div className="p-2 bg-white text-black w-full text-center font-bold">
        Page {index + 1}
      </div>
    </div>
  );
};

export default SinglePage;
