import { createCard } from "@/actions/create-card";
import { useAction } from "../use-action";
import { toast } from "sonner";

const useCreateCardAction = (params?: {
  onSuccess: (data: any) => void,
  onError: (error: any) => void,
}) => {
  const { execute, fieldErrors } = useAction(createCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" created`);
      params?.onSuccess(data);
    },
    onError: (error) => {
      params?.onError(error);
    },
  });
  
  if(!execute) {
    throw new Error("useCreateCardAction: execute is undefined");
  }

  return [execute, fieldErrors];
}

export default useCreateCardAction