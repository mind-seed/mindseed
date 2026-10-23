import * as nodemailer from "nodemailer";
import { MailService, MailServiceError } from "./mail.service";
import { Inject } from "@nestjs/common";
import { mailConfig } from "src/config";
import type { ConfigType } from "@nestjs/config";

export class SmtpMailService extends MailService {
  private transporter: nodemailer.Transporter;

  constructor(
    @Inject(mailConfig.KEY)
    private readonly config: ConfigType<typeof mailConfig>,
  ) {
    super();
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      auth: { user: config.user, pass: config.password },
    });
  }

  async sendVerificationEmail(email: string, code: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to: email,
        subject: "회원가입 인증코드",
        text: `회원가입 인증코드는 ${code} 입니다.`,
      });
    } catch (error) {
      throw new MailServiceError(`Failed to send email: ${error}`);
    }
  }
}
