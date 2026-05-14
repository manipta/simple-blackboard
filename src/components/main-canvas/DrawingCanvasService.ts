export const drawImage = (
  context: CanvasRenderingContext2D | null,
  imageData: CanvasImageSource | HTMLImageElement,
  position: { x: number; y: number },
) => {
  context?.drawImage(imageData, position.x, position.y);
};

export const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    // console.log("Attempting to load base64 image.");

    img.onload = () => {
      // console.log("Base64 image loaded successfully.");
      resolve(img);
    };

    img.onerror = (error) => {
      console.error("Failed to load base64 image:", error);
      reject(new Error("Failed to load base64 image."));
    };
    // console.log(src);

    img.src = src; // Directly set the base64 string
  });
};
