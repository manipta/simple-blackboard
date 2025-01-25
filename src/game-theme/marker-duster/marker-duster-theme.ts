// Pen Config
export const penStroke = {
  lineCap: "round" as CanvasLineCap,
  strokeStyle: `rgba(255, 255, 255, ${0.4 + Math.random() * 0.2})`,
};
export const board = "white";
export const pen =
  "https://raw.github.com/mmoustafa/Chalkboard/master/img/chalk.png";
export const duster = "/assets/duster.png";
// Special Effect
// export const chalkEffect = (
//   canvasContext: CanvasRenderingContext2D,
//   xStart: number,
//   yStart: number,
//   xEnd: number,
//   yEnd: number
// ) => {
// const brushDiameter = 7;
// const length = Math.round(
//   Math.sqrt(Math.pow(xEnd - xStart, 2) + Math.pow(yEnd - yStart, 2)) /
//     (5 / brushDiameter)
// );
// const xUnit = (xEnd - xStart) / length;
// const yUnit = (yEnd - yStart) / length;
// for (var i = 0; i < length; i++) {
//   var xCurrent = xStart + i * xUnit;
//   var yCurrent = yStart + i * yUnit;
//   var xRandom = xCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
//   var yRandom = yCurrent + (Math.random() - 0.5) * brushDiameter * 1.2;
//   canvasContext.clearRect(
//     xRandom,
//     yRandom,
//     Math.random() * 2 + 2,
//     Math.random() + 1
//   );
// }
// xStart = xEnd;
// yStart = yEnd;
// };
