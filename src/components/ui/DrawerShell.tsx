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
            height: height || drawerHeight, // Set height instead of width
            width: "100%", // Make it span the full width of the screen
            borderTopLeftRadius: "24px", // Rounded corners
            borderTopRightRadius: "24px", // Rounded corners
            position: "absolute", // Ensure it's positioned at the bottom
            bottom: 0,
            left: 0,
            backgroundColor: "rgba(17, 24, 39, 0.85)", // Tailwind gray-900 with opacity
            backdropFilter: "blur(16px)", // Glassmorphism effect
            borderTop: "1px solid rgba(75, 85, 99, 0.4)", // Subtle top border
            boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.5)", // Shadow
          },
        }}
      >
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
        </div>
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
