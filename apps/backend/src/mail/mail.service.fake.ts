import { MailService, MailServiceError } from "./mail.service";

export class FakeMailService extends MailService {
  sent: { email: string; code: string }[] = [];
  shouldFail = false;

  // for fake implementation.
  // eslint-disable-next-line
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    if (this.shouldFail) throw new MailServiceError();
    this.sent.push({ email, code });
  }

  lastSentTo(email: string) {
    return this.sent.findLast((m) => m.email === email) ?? null;
  }
}
