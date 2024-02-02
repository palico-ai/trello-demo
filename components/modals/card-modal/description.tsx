"use client";

import { toast } from "sonner";
import { AlignLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { CardWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FormTextarea } from "@/components/form/form-textarea";
import { FormSubmit } from "@/components/form/form-submit";
import { Button } from "@/components/ui/button";
import { Card } from "@prisma/client";
import {
  useGenerate,
  useSummarize,
  useTranslate,
} from "@/hooks/llm/useTextCompletion";
import { Menu, MenuItem } from "@mui/material";

interface DescriptionProps {
  data: CardWithList;
  updateCard: (card: Partial<Card>) => Promise<void>;
}

export const Description = ({ data, updateCard }: DescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(data.description || "");
  const { summarize, loading: loadingSummarize } = useSummarize();
  const { generate, loading: loadingGenerate } = useGenerate();
  const { translate, loading: loadingTranslate } = useTranslate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isTranslateMenuOpen = Boolean(anchorEl);

  const handleChangeDescription = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDescription(e.target.value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const formRef = useRef<ElementRef<"form">>(null);
  const textareaRef = useRef<ElementRef<"textarea">>(null);

  const handleSummarize = async () => {
    const summary = await summarize(description);
    if (summary.message.content) {
      setDescription(summary.message.content.toString());
    }
  };

  const handleGenerate = async () => {
    const generated = await generate(description);
    if (generated.message.content) {
      setDescription(generated.message.content.toString());
    }
  };

  const handleTranslate = async (option: string) => {
    const translated = await translate(description, option);
    if (translated.message.content) {
      setDescription(translated.message.content.toString());
    }
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const disableEditing = () => {
    handleClose();
    setIsEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };

  useEventListener("keydown", onKeyDown);
  // useOnClickOutside(formRef, disableEditing);

  const onSubmit = async (formData: FormData) => {
    const description = formData.get("description") as string;
    await updateCard({
      description,
    });
    disableEditing();
  };

  const loading = useMemo(
    () => loadingSummarize || loadingGenerate || loadingTranslate,
    [loadingSummarize, loadingGenerate, loadingTranslate]
  );

  return (
    <div className="flex items-start gap-x-3 w-full">
      <Menu
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        anchorEl={anchorEl}
        open={isTranslateMenuOpen}
        onClose={() => setAnchorEl(null)}
      >
        {["English", "Spanish", "French", "German", "Italian"].map(
          (language) => (
            <MenuItem key={language} onClick={() => handleTranslate(language)}>
              {language}
            </MenuItem>
          )
        )}
      </Menu>
      <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <p className="font-semibold text-neutral-700 mb-2">Description</p>
        {isEditing ? (
          <form action={onSubmit} ref={formRef} className="space-y-2">
            <FormTextarea
              disabled={loading}
              rows={20}
              value={description}
              onChange={handleChangeDescription}
              id="description"
              className="w-full mt-2"
              placeholder="Add a more detailed description"
              defaultValue={data.description || undefined}
              ref={textareaRef}
            />
            <div className="flex items-center gap-x-2">
              <FormSubmit>Save</FormSubmit>
              <Button
                type="button"
                onClick={handleSummarize}
                size="sm"
                variant="gray"
              >
                Summarize
              </Button>
              <Button
                type="button"
                onClick={handleGenerate}
                size="sm"
                variant="gray"
              >
                Generate
              </Button>
              <Button
                type="button"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                size="sm"
                variant="gray"
              >
                Translate
              </Button>
              <Button
                type="button"
                onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: "450px",
              overflowY: "auto",
            }}
            className="min-h-[78px] bg-neutral-200 text-sm font-medium py-3 px-3.5 rounded-md"
          >
            {data.description || "Add a more detailed description..."}
          </div>
        )}
      </div>
    </div>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[78px] bg-neutral-200" />
      </div>
    </div>
  );
};
