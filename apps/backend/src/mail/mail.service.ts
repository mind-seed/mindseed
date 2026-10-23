import { Injectable } from "@nestjs/common";

export class MailServiceError extends Error {}

@Injectable()
export abstract class MailService {
  // eslint-disable-next-line
  abstract sendVerificationEmail(email: string, code: string): Promise<void>;
}
