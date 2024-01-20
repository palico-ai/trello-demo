import {
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import React, { useContext, useEffect, useRef } from "react";
import PalicoContext from "./palico_contex";
import { AgentAPI } from "@palico-ai/react";

const Header: React.FC = () => {
  return (
    <Box>
      <Typography variant="h6">Copilot</Typography>
      <Divider />
    </Box>
  );
};

interface Message {
  content: string;
  sender: "user" | "bot";
}

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

const MessageInput: React.FC = () => {
  const [message, setMessage] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, loading } = useContext(PalicoContext);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [loading]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await sendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
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
        <MessageInput/>
      </Box>
    </Stack>
  );
};

export default ChatFragment;
