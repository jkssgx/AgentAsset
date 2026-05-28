const path = require("node:path");
const { chromium } = require(
  "/Users/jackysu/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright"
);

async function main() {
  const htmlPath = "/Users/jackysu/AIProjects/AgentAsset/prototype/index.html";
  const outDir = "/Users/jackysu/AIProjects/AgentAsset/prototype";
  const browser = await chromium.launch({
    headless: true,
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 960 },
    deviceScaleFactor: 1,
  });
  await page.goto(`file://${htmlPath}`);
  await page.locator("#screen-dashboard").screenshot({
    path: path.join(outDir, "01-asset-workbench.png"),
  });
  await page.locator("#screen-detail").screenshot({
    path: path.join(outDir, "02-asset-detail.png"),
  });
  await page.locator("#screen-analytics").screenshot({
    path: path.join(outDir, "03-value-analytics.png"),
  });
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
