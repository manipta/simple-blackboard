import { Button, IconButton, TextField, Typography } from "@mui/material";
import { useState } from "react";
import CancelIcon from "@mui/icons-material/Cancel";

const formatTimestamp = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
};

const SaveDialog = ({ saveFunction, closeDialog }: any) => {
  const [fileName, setFileName] = useState(formatTimestamp());
  const [bgColor, setBgColor] = useState("#000000");

  const handleSave = () => {
    saveFunction(bgColor, fileName);
    closeDialog();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[90%] max-w-96">
        <div className="flex justify-between items-center mb-4">
          <Typography variant="h6" className="font-bold">
            Save PDF
          </Typography>
        </div>
        <div className="space-y-6">
          <div>
            <TextField
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              label="File Name"
              fullWidth
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setFileName("")} edge="end">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                ),
              }}
            />
          </div>
          <div>
            <TextField
              label=" Background Color"
              type="color"
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              className="w-full h-10  rounded-md"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button
              variant="outlined"
              color="info"
              onClick={closeDialog}
              className="capitalize"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              className="capitalize"
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveDialog;
