"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { fetcher } from "@/lib/fetcher";
import { AuditLog, Card } from "@prisma/client";
import { useCardModal } from "@/hooks/use-card-modal";

import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { Activity } from "./activity";
import { toast } from "sonner";
import { updateCard } from "@/services/card";
import { Dialog, DialogContent } from "@mui/material";

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const queryClient = useQueryClient();

  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
  });

  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
  });

  const handleUpdateCard = async (updated: Partial<Card>) => {
    if(!id) {
      throw new Error("No card id");
    }
    const card = await updateCard(id, updated)
    queryClient.invalidateQueries({
      queryKey: ["card", card.id],
    });
    queryClient.invalidateQueries({
      queryKey: ["card-logs", card.id]
    });
    toast.success(`Card "${card.title}" updated`);
  }

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={isOpen}
      onClose={onClose}
    >
      <DialogContent sx={{
        padding: 4
      }}>
        {!cardData
          ? <Header.Skeleton />
          : <Header data={cardData} />
        }
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {!cardData
                ? <Description.Skeleton />
                : <Description data={cardData} updateCard={handleUpdateCard} />
              }
              {!auditLogsData
                ? <Activity.Skeleton />
                : <Activity items={auditLogsData} />
              }
            </div>
          </div>
          {!cardData
            ? <Actions.Skeleton />
            : <Actions data={cardData} updateCard={handleUpdateCard} />
          }
        </div>
      </DialogContent>
    </Dialog>
  );
};
