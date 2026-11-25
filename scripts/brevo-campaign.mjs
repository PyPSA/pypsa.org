// Usage: node scripts/brevo-campaign.mjs <content.html> <subject>
// Creates a draft campaign, never schedules or sends it.
import { readFileSync } from "node:fs";

function need(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable ${name}`);
    process.exit(1);
  }
  return value;
}

const [htmlPath, subject] = process.argv.slice(2);
if (!htmlPath || !subject) {
  console.error("Usage: brevo-campaign.mjs <content.html> <subject>");
  process.exit(1);
}

const apiKey = need("BREVO_API_KEY");
const listId = Number(need("BREVO_LIST_ID"));
const senderId = Number(need("BREVO_SENDER_ID"));
const replyTo = process.env.BREVO_REPLY_TO || "contact@pypsa.org";

const MARKER = "<!-- CONTENT -->";
const skeleton = readFileSync(new URL("../brevo/campaign.html", import.meta.url), "utf8");
if (!skeleton.includes(MARKER)) {
  console.error(`brevo/campaign.html has no ${MARKER} marker`);
  process.exit(1);
}
let content;
try {
  content = readFileSync(htmlPath, "utf8");
} catch (err) {
  console.error(`Cannot read ${htmlPath}: ${err.message}`);
  process.exit(1);
}
const htmlContent = skeleton.replace(MARKER, () => content);

const res = await fetch("https://api.brevo.com/v3/emailCampaigns", {
  method: "POST",
  headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({
    name: subject,
    subject,
    sender: { id: senderId },
    replyTo,
    htmlContent,
    recipients: { listIds: [listId] },
  }),
});
if (!res.ok) {
  console.error(`Brevo responded ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const { id } = await res.json();
process.stdout.write(`Created draft campaign ${id}` + "\n");
