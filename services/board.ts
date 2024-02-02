"use server";

import { createAuditLog } from "@/lib/create-audit-log";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

export async function getboardLists(orgId: string, boardId: string) {
  const lists = await db.list.findMany({
    where: {
      boardId: boardId,
      board: {
        orgId,
      },
    },
    orderBy: {
      order: "asc",
    },
  });

  return lists;
}

export async function createList(boardId: string, title: string) {
  const lastList = await db.list.findFirst({
    where: { boardId: boardId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const newOrder = lastList ? lastList.order + 1 : 1;

  const list = await db.list.create({
    data: {
      title,
      boardId,
      order: newOrder,
    },
  });

  await createAuditLog({
    entityTitle: list.title,
    entityId: list.id,
    entityType: ENTITY_TYPE.LIST,
    action: ACTION.CREATE,
  });
  return list;
}

export async function createCard(listId: string, title: string) {
  const { orgId } = auth();
  if (!orgId) {
    throw new Error("Unauthorized. OrgId not found");
  }
  const existingList = await db.list.findUnique({
    where: {
      id: listId,
      board: {
        orgId,
      },
    },
  });

  if (!existingList) {
    throw new Error("List not found");
  }

  const lastCard = await db.card.findFirst({
    where: { listId },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const newOrder = lastCard ? lastCard.order + 1 : 1;

  const card = await db.card.create({
    data: {
      title,
      listId,
      order: newOrder,
    },
  });

  await createAuditLog({
    entityId: card.id,
    entityTitle: card.title,
    entityType: ENTITY_TYPE.CARD,
    action: ACTION.CREATE,
  });

  return card;
}
