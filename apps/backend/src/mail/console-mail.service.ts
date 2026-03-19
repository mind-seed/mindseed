import { MailService } from "./mail.service";

export class ConsoleMailService extends MailService {
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log(
      `MailService not implemented. Destination: ${email}, Code: ${code}.`,
    );
  }
}
