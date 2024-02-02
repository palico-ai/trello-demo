"use client";

import React, { useMemo } from "react";
import { ListWithCards } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateCardOrder } from "@/actions/update-card-order";
import { toast } from "sonner";
import { createCard, createList } from "@/services/board";
import { Card } from "@prisma/client";

export type BoardContextType = {
  boardId: string;
  metadata: {
    notionRootPage?: string;
  }
  data: ListWithCards[];
  setData: React.Dispatch<React.SetStateAction<ListWithCards[]>>;
};

const NotYetImplemented = () => {
  throw new Error("Not yet implemented");
};

const BoardContext = React.createContext<BoardContextType>({
  boardId: "",
  metadata: {},
  data: [],
  setData: NotYetImplemented,
});

export interface BoardProviderProps {
  boardId: string;
  initialData: ListWithCards[];
  children: React.ReactNode;
}

export const BoardContextProvider: React.FC<BoardProviderProps> = ({
  boardId,
  initialData,
  children,
}) => {
  const [data, setData] = React.useState<ListWithCards[]>(initialData);

  return (
    <BoardContext.Provider
      value={{
        boardId,
        data,
        setData,
        metadata: {
          notionRootPage: "41951f65260d4d1e9c6ae297b7f9f06c"
        }
      }}
    >
      {children}
    </BoardContext.Provider>
  );
};

export const useMoveCard = () => {
  const { data, setData, boardId } = React.useContext(BoardContext);

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const moveCard = async (
    cardId: string,
    destinationListId: string,
    index?: {
      destinationOrderIndex?: number;
    }
  ) => {
    let sourceList: ListWithCards | undefined;
    let destList: ListWithCards | undefined;

    setData((current) => {
      const newData = [...current];
      sourceList = newData.find((list) =>
        list.cards.find((card) => card.id === cardId)
      );
      destList = newData.find((list) => list.id === destinationListId);

      const cardItem = sourceList?.cards.find((card) => card.id === cardId);

      if (!cardItem) {
        return newData;
      }

      if (!sourceList || !destList) {
        return newData;
      }

      // Check if cards exists on the sourceList
      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      // Check if cards exists on the destList
      if (!destList.cards) {
        destList.cards = [];
      }

      // Remove card from the source list
      sourceList.cards.splice(cardItem.order, 1);

      // Assign the new listId to the moved card
      cardItem.listId = destinationListId;

      // Add card to the destination list
      destList.cards.splice(index?.destinationOrderIndex ?? 0, 0, cardItem);

      sourceList.cards.forEach((card, idx) => {
        card.order = idx;
      });

      // Update the order for each card in the destination list
      destList.cards.forEach((card, idx) => {
        card.order = idx;
      });
      return newData;
    });

    if (!sourceList || !destList) {
      return;
    }

    await executeUpdateCardOrder({
      boardId: boardId,
      items: [...sourceList.cards, ...destList.cards],
    });
  };

  const moveCards = async (cardIds: string[], destinationListId: string) => {
    const newData = [...data];
    const destList = newData.find((list) => list.id === destinationListId);

    if (!destList) {
      return;
    }

    // Check if cards exists on the destList
    if (!destList.cards) {
      destList.cards = [];
    }

    const cards = cardIds.map((cardId) => {
      const sourceList = newData.find((list) =>
        list.cards.find((card) => card.id === cardId)
      );

      const cardItem = sourceList?.cards.find((card) => card.id === cardId);

      if (!cardItem) {
        return;
      }

      // Remove card from the source list
      sourceList?.cards.splice(cardItem.order, 1);

      // Assign the new listId to the moved card
      cardItem.listId = destinationListId;

      // Add card to the destination list
      destList.cards.push(cardItem);

      sourceList?.cards.forEach((card, idx) => {
        card.order = idx;
      });

      return cardItem;
    });

    // Update the order for each card in the destination list
    destList.cards.forEach((card, idx) => {
      card.order = idx;
    });

    const filteredCards = cards.filter((card) => card !== undefined) as any;

    await executeUpdateCardOrder({
      boardId: boardId,
      items: filteredCards,
    });
    setData(newData);
  };

  return { moveCard, moveCards };
};

export const useCreateCard = () => {
  const { data, setData } = React.useContext(BoardContext);

  const handleCreateCard = async (
    title: string,
    listId: string
  ): Promise<Card> => {
    try {
      console.log("Handling create card");
      console.log({ title, listId });
      const card = await createCard(listId, title);
      setData((current) => {
        const newData = [...current];
        const listIndex = newData.findIndex((list) => list.id === listId);
        const list = current[listIndex];
        if (!list) {
          return current;
        }
        const newList : ListWithCards = {
          ...list!,
          cards: [...list.cards, card]
        }
        newData[listIndex] = newList;
        return newData
      });
      toast.success(`Card "${card.title}" created`);
      return card;
    } catch (error) {
      console.log(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Something went wrong");
      }
      throw error;
    }
  };

  const handleCreateCards = async (
    titles: string[],
    listId: string
  ): Promise<Card[]> => {
    const cards = await Promise.all(titles.map((title) => createCard(listId, title)));
    setData((current) => {
      const newData = [...current];
      const listIndex = newData.findIndex((list) => list.id === listId);
      const list = current[listIndex];
      if (!list) {
        return current;
      }
      const newList : ListWithCards = {
        ...list!,
        cards: [...list.cards, ...cards]
      }
      newData[listIndex] = newList;
      return newData
    });
    toast.success(`Cards created`);
    return cards;
  }

  return {createCard: handleCreateCard, createCards: handleCreateCards};
};

export const useCreateList = () => {
  const { data, setData, boardId } = React.useContext(BoardContext);

  const handleCreateList = async (title: string) => {
    try {
      const newList = await createList(boardId, title);
      setData((current) => {
        const newData = [...current];
        newData.push({
          ...newList,
          cards: [],
        });
        return newData;
      });
      toast.success(`List "${newList.title}" created`);
      return newList;
    } catch (e) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message || "Something went wrong");
      }
      throw e;
    }
  };

  const createLists = async (titles: string[]) => {
    const newLists = await Promise.all(titles.map((title) => createList(boardId, title)));
    setData((current) => {
      const newData = [...current];
      newLists.forEach((list) => {
        newData.push({
          ...list,
          cards: [],
        });
      });
      return newData;
    });
    toast.success(`Lists created`);
    return newLists;
  }

  return {
    createList: handleCreateList,
    createLists,
  };
};

export type FormattedBoard = {
  boardId: string
  lists: {
    id: string
    name: string
    cards: {
      id: string
      name: string
    }[]
  }[]
}

export const useBoardCurrentState = () : FormattedBoard => {
  const {boardId, data} = React.useContext(BoardContext)

  const boardState = useMemo(() => {
    return {
      boardId,
      lists: data.map((list) => ({
        id: list.id,
        name: list.title,
        cards: list.cards.map((card) => ({
          id: card.id,
          name: card.title,
        })),
      })),
    }
  }, [boardId, data])

  return boardState
}

export default BoardContext;
