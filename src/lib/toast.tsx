import {
  Toaster,
  ToastCloseTrigger,
  ToastDescription,
  ToastIndicator,
  ToastRoot,
  ToastTitle,
} from "@chakra-ui/react";
import { toastStore } from "./toastStore";

export function AppToaster() {
  return (
    <Toaster toaster={toastStore}>
      {(toast) => (
        <ToastRoot>
          <ToastIndicator />
          <ToastTitle>{toast.title}</ToastTitle>
          <ToastDescription>{toast.description}</ToastDescription>
          <ToastCloseTrigger />
        </ToastRoot>
      )}
    </Toaster>
  );
}
