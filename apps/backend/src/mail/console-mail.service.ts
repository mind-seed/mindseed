import { MailService } from "./mail.service";

export class ConsoleMailService extends MailService {
  // eslint-disable-next-line
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log(
      `MailService not implemented. Destination: ${email}, Code: ${code}.`,
    );
  }
}
