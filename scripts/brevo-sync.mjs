// Pushes brevo/doi.html to the Brevo double opt-in template.
import { readFileSync } from "node:fs";

function need(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing environment variable ${name}`);
    process.exit(1);
  }
  return value;
}

const apiKey = need("BREVO_API_KEY");
const templateId = need("BREVO_DOI_TEMPLATE_ID");
const senderId = Number(need("BREVO_SENDER_ID"));
const replyTo = process.env.BREVO_REPLY_TO || "contact@pypsa.org";
const htmlContent = readFileSync(new URL("../brevo/doi.html", import.meta.url), "utf8");

const res = await fetch(`https://api.brevo.com/v3/smtp/templates/${templateId}`, {
  method: "PUT",
  headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
  body: JSON.stringify({ htmlContent, sender: { id: senderId }, replyTo }),
});
if (!res.ok) {
  console.error(`Brevo responded ${res.status}: ${await res.text()}`);
  process.exit(1);
}
process.stdout.write(`Updated template ${templateId}` + "\n");
