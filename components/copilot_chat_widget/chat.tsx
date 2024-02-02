"use client";
import BoardContext, { useBoardCurrentState } from "@/context/board";
import { getboardLists } from "@/services/board";
import { CodaPage, getCodaPageContent, getCodaPages } from "@/services/coda";
import { getNotionPageContent, getSubPages } from "@/services/notion";
import { useAuth } from "@clerk/nextjs";
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { PalicoContext } from "@palico-ai/react";
import React, { useContext, useEffect, useMemo, useRef } from "react";

const Header: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">Copilot</Typography>
      <Divider />
    </Box>
  );
};

const MessageHistory: React.FC = () => {
  const [lastMessageEl, setLastMessageEl] =
    React.useState<HTMLDivElement | null>(null);
  const { conversationHistory: messageHistory } = useContext(PalicoContext);

  useEffect(() => {
    if (lastMessageEl) {
      lastMessageEl.scrollIntoView();
    }
  }, [lastMessageEl]);

  return (
    <>
      {messageHistory.map((conversation, index) => {
        const isLastMessage = index === messageHistory.length - 1;
        const isUserMessage = conversation.role === "user";

        return (
          <Box
            key={index}
            ref={isLastMessage ? setLastMessageEl : undefined}
            sx={{
              borderRadius: 2,
              mb: 1,
              px: 2,
              py: 1,
              backgroundColor:
                conversation.role === "user" ? "#e0e0e0" : "#f5f5f5",
            }}
          >
            <Typography
              variant="body1"
              textAlign={isUserMessage ? "right" : "left"}
            >
              {conversation.content ?? "Invalid message"}
            </Typography>
          </Box>
        );
      })}
    </>
  );
};

enum ComplexMessageType {
  Text,
  Coda,
}

interface CodaMessage {
  type: ComplexMessageType.Coda;
  content: {
    name: string;
    codaDocId: string;
    codaPageId: string;
  };
}

interface TextMessage {
  type: ComplexMessageType.Text;
  content: string;
}

type MenuItem = {
  type: "notion";
  label: string;
  payload: {
    pageId: string;
    title: string;
  };
};

type MenuItemWithKey = MenuItem & {
  key: string;
};

const MessageInput: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const { loading, sendMessage } = useContext(PalicoContext);
  const {
    metadata: { notionRootPage },
  } = useContext(BoardContext);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOptions, setMenuOptions] = React.useState<MenuItemWithKey[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>();
  const currentBoard = useBoardCurrentState();
  // TODO: Create keyword sets and indexes for complex objects
  // Keywords should be highlighted in the input field
  // When pressing backspace at a keyword index, the last keyword should be deleted
  // I think its easier to just use coda urls if possible

  useEffect(() => {
    const run = async () => {
      if (!notionRootPage) {
        return;
      }
      const subpages = await getSubPages(notionRootPage);
      setMenuOptions(
        subpages.map((page) => ({
          type: "notion",
          key: (page.id as string).substring(0, 5),
          label: page.title,
          payload: {
            pageId: page.id,
            title: page.title,
          },
        }))
      );
    };

    run();
  }, [notionRootPage]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const lastChar = event.target.value[event.target.value.length - 1];
    const ignoreChars = new Set(["[", "]"]);
    if (ignoreChars.has(lastChar)) {
      return;
    }
    if (lastChar === "@") {
      handleMenuOpen();
    } else {
      setMessage(event.target.value);
    }
  };

  const handleSelectMenuItem = (page: MenuItemWithKey) => {
    switch (page.type) {
      case "notion":
        setMessage(`${message}[Key: ${page.key}] `);
        break;
    }
    closeMenu();
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(message);
    const menuItemSelected = menuOptions.filter((option) =>
      message.includes(option.key)
    );
    const variables = await Promise.all(menuItemSelected.map(async (item) => {
      const pageContent = await getNotionPageContent(item.payload.pageId);
      const key = item.key;
      return { key, value: pageContent};
    }));
    console.log(menuItemSelected)
    console.log(JSON.stringify(variables));
    await sendMessage(message, {
      variables,
      currentBoard
    });
    setMessage("");
  };

  const handleMenuOpen = () => {
    setMenuAnchorEl(inputRef.current);
  };

  const closeMenu = () => {
    setMenuAnchorEl(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Menu
        onClose={closeMenu}
        open={Boolean(menuAnchorEl)}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        sx={{
          "& .MuiPaper-root": {
            minWidth: 200,
            maxHeight: 300,
          },
        }}
        anchorEl={menuAnchorEl}
      >
        {menuOptions.map((item, index) => {
          return (
            <MenuItem key={index} onClick={() => handleSelectMenuItem(item)}>
              {item.payload.title}
            </MenuItem>
          );
        })}
      </Menu>
      <TextField
        autoComplete="off"
        ref={inputRef}
        disabled={loading}
        inputRef={inputRef}
        size="small"
        fullWidth
        variant="outlined"
        value={message}
        onChange={handleChange}
      />
    </form>
  );
};

const ChatFragment: React.FC = () => {
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="stretch"
      spacing={2}
      sx={{
        p: 2,
        height: "100%",
      }}
    >
      <Box>
        <Header />
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          overflowY: "scroll",
        }}
      >
        <MessageHistory />
      </Box>
      <Divider />
      <Box
        sx={{
          mt: 2,
        }}
      >
        <MessageInput />
      </Box>
    </Stack>
  );
};

export default ChatFragment;
