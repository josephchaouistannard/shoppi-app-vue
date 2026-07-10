import { ref } from "vue";

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const visible = ref(false);
const options = ref<ConfirmOptions>({});
let resolver: ((value: boolean) => void) | null = null;

export function useConfirm() {
  function confirm(config: ConfirmOptions = {}) {
    options.value = {
      title: "Confirm",
      message: "Are you sure?",
      confirmText: "Confirm",
      cancelText: "Cancel",
      ...config,
    };

    visible.value = true;

    return new Promise<boolean>((resolve) => {
      resolver = resolve;
    });
  }

  function close(result: boolean) {
    visible.value = false;
    resolver?.(result);
    resolver = null;
  }

  return {
    visible,
    options,
    confirm,
    close,
  };
}
