import { Module } from "@nestjs/common";
import { MailService } from "./mail.service";
import { ConsoleMailService } from "./console-mail.service";
import { SmtpMailService } from "./smtp-mail.service";
import { mailConfig } from "src/config";
import { ConfigType } from "@nestjs/config";

@Module({
  providers: [
    {
      provide: MailService,
      useFactory: (config: ConfigType<typeof mailConfig>) =>
        config.driver === "smtp"
          ? new SmtpMailService(config)
          : new ConsoleMailService(),
      inject: [mailConfig.KEY],
    },
  ],
  exports: [MailService],
})
export class MailModule {}
