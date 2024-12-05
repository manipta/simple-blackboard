import React, {
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
  useState,
} from "react";
import Dialog from "@mui/material/Dialog";
import { IconButton } from "@mui/material";
import { MdClose } from "react-icons/md";

const DialogServiceContext = React.createContext({
  openDialog: (
    _content: ReactNode,
    _title?: string,
    _onClose?: (_: any) => void
  ) => {},
  closeDialog: (_result?: any) => {},
});

const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null as ReactNode);
  const [title, setTitle] = useState("" as string | undefined);
  const [onClose, setOnClose] = useState(undefined as Function | undefined);

  const openDialog = (
    component: ReactNode,
    title?: string,
    onClose?: Function
  ) => {
    setContent(component);
    setTitle(title);
    setOnClose(onClose);
    setOpen(true);
  };

  const closeDialog = (result?: any) => {
    if (typeof onClose === "function") {
      onClose(result);
    }
    setContent(null);
    setOpen(false);
  };

  return (
    <DialogServiceContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog
        open={open}
        onClose={() => closeDialog()}
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <div className="min-w-[300px]">
          {title && (
            <div className="flex justify-between p-4">
              <h4 className="font-bold my-auto">{title}</h4>
              <span></span>
              <IconButton
                aria-label="close-dialog"
                onClick={() => closeDialog()}
              >
                <MdClose />
              </IconButton>
            </div>
          )}
          {isValidElement(content) &&
            cloneElement(content, { closeDialog } as any)}
        </div>
      </Dialog>
    </DialogServiceContext.Provider>
  );
};

const useDialogProvider = () => {
  const context = useContext(DialogServiceContext);
  if (!context) {
    throw new Error("useDialogService must be used within a DialogService");
  }
  return context;
};

export { DialogProvider, useDialogProvider };
