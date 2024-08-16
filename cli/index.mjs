import { intro, log, outro, spinner } from "@clack/prompts";
import chalk from "chalk";
import { program } from "commander";
import { execSync } from "node:child_process";
import { openSync, readFileSync } from "node:fs";
import { Aggregator, AggregatorError } from "./aggregator/aggregator.mjs";
import { getBuildCommand } from "./utils/build-command.mjs";
import { byeBye } from "./utils/prompt-utils.mjs";

/** @typedef {{ config?: string, sources?: string, output?: string, build?: boolean, open?: boolean, includeHtml?: boolean }} Options */

function printValue(value) {
  switch (typeof value) {
    case "boolean":
      return value ? "yes" : "no";
    default:
      return value;
  }
}

function printVersionWarning() {
  const fd = openSync("package.json", "r");
  const data = readFileSync(fd, "utf-8");

  try {
    const pkg = JSON.parse(data);

    // Ex: 0.0.1-alpha.0
    const [version, preRelease] = pkg.version.split("-");
    if (preRelease) {
      const [preReleaseName, preReleaseVersion] = preRelease.split(".");

      let preReleaseMessage = `This is a ${chalk.bold("pre-release")} version.`;
      switch (preReleaseName) {
        case "alpha":
          preReleaseMessage = `This is an ${chalk.bold("alpha")} version.`;
          break;
        case "beta":
          preReleaseMessage = `This is a ${chalk.bold("beta")} version.`;
          break;
        case "rc":
          preReleaseMessage = `This is a ${chalk.bold(
            "release"
          )} candidate version.`;
          break;
      }

      log.message(
        `🚧 Version: ${chalk.bold.redBright(
          `${version}-${chalk.underline(preReleaseName)}.${preReleaseVersion}`
        )}. ${preReleaseMessage} Use with caution 🚧`
      );
    } else {
      const [major, minor, patch] = version.split(".");

      if (major !== "0") {
        log.message(`Version: ${chalk.bold.greenBright(version)}`);
      } else {
        log.message(
          `🚧 Version: ${chalk.bold.redBright(
            `${version}`
          )}. This has yet to be stabilized. Use with caution 🚧`
        );
      }
    }
  } catch (err) {
    log.error(chalk.bold.red(err.name) + "\n" + err.message);
    byeBye(-1);
  }
}

/** @param {Options} options  */
function validateOptions(options) {
  if (Object.keys(options).length === 0) {
    throw new Error("No options provided.");
  } else {
    /** A list of potential arguments configurations */
    /** @type {Array<{required: keyof Options[], optional: keyof Options[]}>} */
    const correctOptions = [
      { required: ["config"] },
      { required: ["build"] },
      {
        required: ["sources", "output"],
        optional: ["open", "includeHtml"],
      },
    ];

    const providedOptions = Object.keys(options);

    const correct = correctOptions.some((opts) =>
      providedOptions
        .filter((opt) => !opts.optional?.includes(opt))
        .every((opt) => opts.required.includes(opt))
    );

    if (!correct) {
      throw new Error(
        `Invalid options provided. Please provide either a ${chalk.bold(
          "configuration"
        )} file, ${chalk.bold("sources")} and ${chalk.bold(
          "output"
        )}, or use the build command. Use ${chalk.cyan(
          "--help"
        )} to see the available options!`
      );
    }
  }
}

function printOptions(options) {
  return Object.entries(options)
    .map(([opt, value]) => `${opt}: ${chalk.cyan(printValue(value))}`)
    .join("\n");
}

async function main() {
  program
    .option("-c, --config <string>", "path to the config file")
    .option(
      "-s, --sources <string>",
      "glob to use to find json reports to aggregate"
    )
    .option(
      "-o, --output <string>",
      "output directory to write the aggregated report to"
    )
    .option(
      "-b, --build",
      "use command builder to help you in generating the command"
    )
    .option("-O, --open", "open the aggregated report after building")
    .option(
      "-I, --include-html",
      "include HTML reports found alongside the JSON reports?"
    );

  program.parse();

  /** @type {Options} */
  const options = program.opts();

  intro("Playwright Reports Aggregator");

  printVersionWarning();

  try {
    validateOptions(options);
  } catch (err) {
    log.error(chalk.bold.red(err.name) + "\n" + err.message);
    log.info(
      `Use the ${chalk.bold("--help")} flag to see the available options`
    );

    outro(chalk.bold.red("¯\\_(ツ)_/¯"));

    process.exit(1);
  }

  if (options.build) {
    await getBuildCommand();

    return;
  }

  log.info(`Building using:\n${printOptions(options)}`);

  const aggregator = new Aggregator(options);
  const loader = spinner();

  aggregator.events.on("progress", (progress) => {
    loader.message(`Building aggregated report: ${progress}%`);
  });

  aggregator.events.on(
    "error",
    /** @param {AggregatorError} err  */
    (err) => {
      loader.stop("Failed to build aggregated report");

      log.error(chalk.bold.red(err.name) + "\n" + err.message);

      const errCode = err.code ?? 1;

      outro(chalk.bold.red(`Exited with error code: ${errCode}`));

      process.exit();
    }
  );

  loader.start("Aggregating report: 0%");
  await aggregator.aggregate();
  loader.stop("Report aggregated!");

  if (options.open) {
    log.info("Opening aggregated report...");

    try {
      execSync(`open ${options.output}/index.html`);
    } catch (err) {
      log.error(chalk.bold.red(err.name) + "\n" + err.message);

      const errCode = err.code ?? 1;

      outro(chalk.bold.red(`Exited with error code: ${errCode}`));

      process.exit();
    }
  }

  outro("All done!");
}

main();
