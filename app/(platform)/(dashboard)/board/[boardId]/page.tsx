import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { ListContainer } from "./_components/list-container";
import CopilotChatWidget from "@/components/copilot_chat_widget";
import { Box } from "@mui/material";
import { BoardContextProvider } from "@/context/board";
import BoardCopilot from "@/context/board_copilot";

interface BoardIdPageProps {
  params: {
    boardId: string;
  };
}

const BoardIdPage = async ({ params }: BoardIdPageProps) => {
  const { orgId } = auth();

  if (!orgId) {
    redirect("/select-org");
  }

  const lists = await db.list.findMany({
    where: {
      boardId: params.boardId,
      board: {
        orgId,
      },
    },
    include: {
      cards: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return (
    <BoardContextProvider initialData={lists} boardId={params.boardId}>
      <BoardCopilot>
        <div className="p-4 h-full overflow-x-auto">
          <ListContainer boardId={params.boardId} data={lists} />
          <Box
            sx={{
              position: "fixed",
              bottom: "2rem",
              right: "2rem",
            }}
          >
            <CopilotChatWidget />
          </Box>
        </div>
      </BoardCopilot>
    </BoardContextProvider>
  );
};

export default BoardIdPage;
