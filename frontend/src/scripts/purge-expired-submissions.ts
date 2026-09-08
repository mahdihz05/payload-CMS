import config from "@payload-config";
import { getPayload } from "payload";

async function main() {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) throw new Error("DATABASE_URI and PAYLOAD_SECRET are required.");
  const payload = await getPayload({ config });
  const expired = await payload.find({
    collection: "form-submissions",
    depth: 1,
    limit: 1000,
    overrideAccess: true,
    where: { expiresAt: { less_than_equal: new Date().toISOString() } },
  });
  let deletedFiles = 0;
  for (const submission of expired.docs) {
    const files = await payload.find({ collection: "submission-files", limit: 1000, overrideAccess: true, where: { submission: { equals: submission.id } } });
    for (const file of files.docs) {
      await payload.delete({ collection: "submission-files", id: file.id, overrideAccess: true });
      deletedFiles += 1;
    }
    const formKey = typeof submission.form === "object" ? submission.form.key : String(submission.form);
    await payload.create({ collection: "audit-logs", overrideAccess: true, data: {
      actorType: "system", action: "retention_purge", objectType: "form_submission", objectID: String(submission.id),
      before: { form: formKey, files: files.totalDocs }, after: {}, occurredAt: new Date().toISOString(),
    } });
    await payload.delete({ collection: "form-submissions", id: submission.id, overrideAccess: true });
  }
  payload.logger.info(`Purged ${expired.totalDocs} submission(s) and ${deletedFiles} private file(s).`);
  process.exit(0);
}

await main();
