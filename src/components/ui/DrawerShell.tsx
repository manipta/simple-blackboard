import { Drawer, Box } from "@mui/material";
import { ReactNode } from "react"; // Adjust the path accordingly
import { useDrawerShell } from "../../services/providers/DrawerShellProvider";

interface DrawerShellProps {
  menu: ReactNode;
  children: ReactNode;
  height?: number;
}

const drawerHeight = 256; // Height of the drawer

export const DrawerShell = ({ menu, children, height }: DrawerShellProps) => {
  const { isOpen, closeDrawer } = useDrawerShell();

  return (
    <div className="full-max w-full flex overflow-hidden absolute">
      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={isOpen}
        onClose={closeDrawer}
        ModalProps={{
          keepMounted: true, // Better performance on mobile
        }}
        anchor="bottom" // Position the drawer at the bottom
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            height: height | drawerHeight, // Set height instead of width
            width: "100%", // Make it span the full width of the screen
            borderTopLeftRadius: "8px", // Optional: rounded corners
            borderTopRightRadius: "8px", // Optional: rounded corners
            position: "absolute", // Ensure it's positioned at the bottom
            bottom: 0,
            left: 0,
          },
        }}
      >
        {menu}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          overflow: "auto",
        }}
      >
        {children}
      </Box>
    </div>
  );
};
