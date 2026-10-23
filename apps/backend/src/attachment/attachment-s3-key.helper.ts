export function createAttachmentS3Key(identifier: string): string {
  return `attachments/${identifier}`;
}
