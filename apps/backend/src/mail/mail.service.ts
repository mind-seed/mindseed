import { Injectable } from "@nestjs/common";

export class MailServiceError extends Error {}

// TODO implementation
@Injectable()
export class MailService {
  // eslint-disable-next-line
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    console.log(
      `MailService not implemented. Destination: ${email}, Code: ${code}.`,
    );
  }
}
