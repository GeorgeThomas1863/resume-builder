import { spawn } from "node:child_process";

const child = spawn("npx vitest run --reporter=json", { shell: true, windowsHide: true });
let stdout = "";
let stderr = "";

child.stdout.on("data", (chunk) => { stdout += chunk; });
child.stderr.on("data", (chunk) => { stderr += chunk; });

child.on("error", (error) => {
  console.error(`Unable to start Vitest: ${error.message}`);
  process.exit(1);
});

child.on("close", () => {
  try {
    const firstBrace = stdout.indexOf("{");
    if (firstBrace < 0) throw new Error(stderr.trim() || "Vitest did not produce JSON");
    const report = JSON.parse(stdout.slice(firstBrace));
    const total = Number(report.numTotalTests ?? 0);
    const passed = Number(report.numPassedTests ?? 0);
    const failed = Number(report.numFailedTests ?? 0);
    const collectionErrors = (report.testResults ?? []).filter((suite) =>
      suite.status === "failed" && (suite.assertionResults ?? []).length === 0
    ).length;
    console.log(`${total} total / ${passed} passed / ${failed} failed`);
    process.exit(total >= 15 && collectionErrors === 0 ? 0 : 1);
  } catch (error) {
    console.error(`Invalid Vitest JSON report: ${error.message}`);
    process.exit(1);
  }
});
