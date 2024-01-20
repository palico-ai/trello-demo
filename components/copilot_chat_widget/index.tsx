'use client';

import React, { useMemo } from "react";
import Button from "@mui/material/Button";
import { Box, IconButton, Paper, Popover } from "@mui/material";
import CopilotIcon from '@mui/icons-material/AcUnit';
import ChatFragment from "./chat";

const CopilotChatWidget: React.FC = () => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const open = useMemo(() => Boolean(anchorEl) , [anchorEl]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Button startIcon={<CopilotIcon />} sx={{
        color: "#fff",
      }} size="large" onClick={handleClick}>
        Copilot
      </Button>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Paper sx={{
          width: "400px",
          height: "500px",
        }}>
          <ChatFragment />
        </Paper>
      </Popover>
    </Box>
  );
};

export default CopilotChatWidget;
