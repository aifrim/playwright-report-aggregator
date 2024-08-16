import { isCancel } from "@clack/core";
import { outro } from "@clack/prompts";

export function isCancelByeBye(result) {
  if (isCancel(result)) {
    byeBye(-1);
  }
}

export function byeBye(code = 0) {
  outro(`🚧 Cancelled. Exiting...`);

  process.exit(code);
}
