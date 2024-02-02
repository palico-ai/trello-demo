"use server";

import { createAuditLog } from "@/lib/create-audit-log";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { ACTION, Card, ENTITY_TYPE } from "@prisma/client";
import { revalidatePath } from "next/cache";

export const updateCard = async (
  cardId: string,
  data: Partial<Card>
) => {
  const { userId, orgId } = auth();

  if (!userId || !orgId) {
    throw new Error("Unauthorized");
  }

  const card = await db.card.update({
    where: {
      id: cardId,
      list: {
        board: {
          orgId,
        },
      },
    },
    data: {
      ...data,
    },
  });

  await createAuditLog({
    entityTitle: card.title,
    entityId: card.id,
    entityType: ENTITY_TYPE.CARD,
    action: ACTION.UPDATE,
  });
  return card;
};
