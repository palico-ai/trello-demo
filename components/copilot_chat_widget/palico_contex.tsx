"use client";
import { AgentAPI, AgentCallResponse } from "@palico-ai/react";
import React, { useEffect } from "react";

export interface ChatMessage {
  content: string;
  role: "user" | "assistant";
}

interface PalicoContextProps {
  loading: boolean;
  deploymentId: number;
  conversationHistory: ChatMessage[];
  sendMessage: (message: string) => Promise<void>;
}

const PalicoContext = React.createContext<PalicoContextProps>({
  loading: false,
  deploymentId: -1,
  conversationHistory: [],
  sendMessage: async () => {},
});

interface PalicoContextProviderProps {
  deploymentId: number;
  children: React.ReactNode;
}

export const PalicoContextProvider: React.FC<PalicoContextProviderProps> = ({
  deploymentId,
  children,
}) => {
  const [loading, setLoading] = React.useState<boolean>(false);
  const [conversationId, setConversationId] = React.useState<number>();
  const [messageHistory, setMessageHistory] = React.useState<ChatMessage[]>([]);
  const [pendingMessage, setPendingMessage] = React.useState<string>();

  useEffect(() => {
    const handlePendingMessage = async () => {
      if (!pendingMessage) return;
      try{
        if(!conversationId){
          const { conversationId, message } = await AgentAPI.newConversation({
            deploymentId,
            message: pendingMessage,
          });
          setConversationId(conversationId);
          setMessageHistory([
            ...messageHistory,
            {
              content: message.content?.toString() ?? "Invalid message",
              role: "assistant",
            },
          ]);
        }else {
          const { message } = await AgentAPI.replyAsUser({
            deploymentId,
            conversationId,
            message: pendingMessage,
          });
          setMessageHistory([
            ...messageHistory,
            {
              content: message.content?.toString() ?? "Invalid message",
              role: "assistant",
            },
          ]);
        }
      }catch(e){
        console.log(e);
      }finally{
        setPendingMessage(undefined);
        setLoading(false);
      }
    }

    void handlePendingMessage();
  }, [conversationId, deploymentId, messageHistory, pendingMessage]);


  const sendMessage = async (message: string) => {
    setLoading(true);
    setPendingMessage(message);
    setMessageHistory([
      ...messageHistory,
      {
        content: message,
        role: "user",
      },
    ])
  }

  return (
    <PalicoContext.Provider
      value={{ deploymentId, conversationHistory: messageHistory, sendMessage, loading }}
    >
      {children}
    </PalicoContext.Provider>
  );
};

export default PalicoContext;
