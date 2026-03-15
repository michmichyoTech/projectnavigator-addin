import { bootstrapTaskPane } from "./taskpane-bootstrap.js";

function renderFatalError(error) {
  const root = document.getElementById("project-navigator-root");

  if (!root) {
    return;
  }

  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  const stack = error instanceof Error && error.stack ? error.stack : "";

  root.innerHTML = `
    <section style="padding:16px;font-family:Aptos,Segoe UI,sans-serif;">
      <h1 style="margin:0 0 12px;font-size:20px;">Project Navigator failed to load</h1>
      <p style="margin:0 0 12px;color:#9a3412;">${message}</p>
      <pre style="white-space:pre-wrap;font-size:12px;color:#2d2418;">${stack}</pre>
    </section>
  `;
}

window.addEventListener("error", (event) => {
  if (event.error) {
    renderFatalError(event.error);
  } else {
    renderFatalError(event.message || "Script error");
  }
});

async function startTaskPane() {
  const officeApi = window.Office;

  if (officeApi && typeof officeApi.onReady === "function") {
    await officeApi.onReady();
  }

  await bootstrapTaskPane();
}

startTaskPane().catch((error) => {
  renderFatalError(error);
  throw error;
});
