'use client'
import { PalicoContextProvider, ToolHandler } from '@palico-ai/react'
import React, { useMemo } from 'react'
import { useCreateCard, useCreateList, useMoveCard } from './board'
import { Card, List } from '@prisma/client'

interface BoardCopilotProps {
  children: React.ReactNode
}

interface CreateListToolInput {
  name: string
  boardId: string
}

interface CreateListToolOutput {
  listId: string
}

const BoardCopilot: React.FC<BoardCopilotProps> = ({ children }) => {
  const {createCards} = useCreateCard()
  const {createLists} = useCreateList()
  const {moveCards} = useMoveCard()

  const tools: Record<string, ToolHandler<any, any>> = useMemo(() => {
    const CreateListsToolHandler: ToolHandler<{titles: string[]}, List[]> = async (input) => {
      console.log("CreateListToolHandler", input)
      const list = await createLists(input.titles)
      return list
    }

    const CreateCardsToolHandler: ToolHandler<{listId: string, titles: string[]}, Card[]> = async (input) => {
      console.log("CreateCardToolHandler", input)
      const cards = await createCards(input.titles, input.listId)
      return cards
    }

    const MoveCardToolHandler: ToolHandler<any, any> = async (input: any) => {
      console.log("MoveCardToolHandler", input)
      await moveCards(input.cardIds, input.listId)
    }

    return {
      'create_lists': CreateListsToolHandler,
      "create_cards": CreateCardsToolHandler,
      "move_cards": MoveCardToolHandler,
    }
  }, [createCards, createLists, moveCards])

  return (
    <PalicoContextProvider tools={tools} deploymentId={7}>
      {children}
    </PalicoContextProvider>
  )
}

export default BoardCopilot