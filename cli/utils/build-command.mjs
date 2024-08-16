import { log, outro, select, text } from "@clack/prompts";
import chalk from "chalk";
import { globby } from "globby";
import { isCancelByeBye } from "./prompt-utils.mjs";

export async function getBuildCommand() {
  let accepted = false;
  let input = "";

  do {
    const result = await text({
      message: "Where should we look for json reports?",
      defaultValue: "./reports/**/*.json",
    });

    isCancelByeBye(result);

    const sources = await globby(result);

    if (sources.length === 0) {
      log.error(
        `No reports found at ${result}.\nPlease try another glob pattern.`
      );

      continue;
    }

    log.success(
      `Found ${sources.length} reports at ${chalk.green.bold(
        result
      )}:\n${chalk.cyan(sources.slice(0, 5).join("\n"))}${
        sources.length > 5 ? chalk.cyanBright("\n...") : ""
      }`
    );

    const isOk = await select({
      message: "Is this correct?",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    });

    isCancelByeBye(result);

    accepted = isOk;
    input = result;
  } while (!accepted);

  const output = await text({
    message: "Where should we write the aggregated report to?",
    defaultValue: "./reports",
  });

  isCancelByeBye(output);

  const includeHtml = await select({
    message:
      "Include HTML reports? (located in the same directory as the JSON reports)",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });

  isCancelByeBye(includeHtml);

  const open = await select({
    message: "Open aggregated report?",
    options: [
      { value: true, label: "Yes" },
      { value: false, label: "No" },
    ],
  });

  isCancelByeBye(open);

  let cmd = `npx playwright-report-aggregator --sources "${input}" --output "${output}"`;

  if (includeHtml) {
    cmd += " --include-html";
  }

  if (open) {
    cmd += " --open";
  }

  log.success(`Your command is:\n\n${chalk.cyan(cmd)}`);

  outro(`You're all set!`);
}
