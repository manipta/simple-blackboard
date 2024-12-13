import ColorPicker from "@radial-color-picker/react-color-picker";
import "@radial-color-picker/react-color-picker/dist/style.css";
const ColorPickerComponent = ({ color, setColor }) => {
  const onInput = (hue) => {
    setColor((prev) => ({ ...prev, hue }));
  };

  return (
    <div className=" p-0 m-0 flex items-center">
      <ColorPicker {...color} onInput={onInput} />
    </div>
  );
};

export default ColorPickerComponent;
