import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1761200000000 implements MigrationInterface {
  name = "InitialSchema1761200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 이전에 synchronize로 스키마가 만들어진 데이터베이스에서도 안전하게
    // 마이그레이션을 통과시키기 위한 guard.
    if (await queryRunner.hasTable("user")) {
      return;
    }

    const queries = [
      `CREATE TABLE "user_profile" ("id" SERIAL NOT NULL, "nickname" character varying NOT NULL, "age" integer NOT NULL, "points" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "character_index" integer NOT NULL DEFAULT '0', "user_id" integer NOT NULL, CONSTRAINT "REL_eee360f3bff24af1b689076520" UNIQUE ("user_id"), CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."user_role_enum" AS ENUM('USER', 'ADMIN')`,
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."post_comment_deletion_type_enum" AS ENUM('AUTHOR', 'ADMIN')`,
      `CREATE TABLE "post_comment" ("id" SERIAL NOT NULL, "nickname" character varying NOT NULL, "content" text NOT NULL, "post_id" integer NOT NULL, "author_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "deleted_by" integer, "deletion_type" "public"."post_comment_deletion_type_enum", CONSTRAINT "PK_5a0d63e41c3c55e11319613550c" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."post_category_enum" AS ENUM('CONCERN', 'DIARY', 'INQUIRY', 'OTHER')`,
      `CREATE TABLE "post" ("id" SERIAL NOT NULL, "content" text NOT NULL, "category" "public"."post_category_enum" NOT NULL, "nickname" character varying NOT NULL, "author_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "like_count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_be5fda3aac270b134ff9c21cdee" PRIMARY KEY ("id"))`,
      `CREATE TABLE "attachment" ("id" SERIAL NOT NULL, "confirmed" boolean NOT NULL DEFAULT false, "s3_key" character varying NOT NULL, "index" integer, "post_id" integer, CONSTRAINT "PK_d2a80c3a8d467f08a750ac4b420" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."counsel_category_enum" AS ENUM('ANXIETY', 'DEPRESSION', 'STRESS', 'OTHER')`,
      `CREATE TABLE "counsel" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "category" "public"."counsel_category_enum" NOT NULL, "author_id" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "responder_id" integer, "response_content" text, CONSTRAINT "PK_312423543be484551545fcdbe54" PRIMARY KEY ("id"))`,
      `CREATE TABLE "diagnosis_entry" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "depression_score" integer NOT NULL, "anxiety_score" integer NOT NULL, "stress_score" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_958f8ce5190284363dbf61add37" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."mission_category_enum" AS ENUM('ANXIETY', 'DEPRESSION', 'STRESS')`,
      `CREATE TABLE "mission" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "min_level" integer NOT NULL, "category" "public"."mission_category_enum" NOT NULL, "points" integer NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_54f1391034bc7dd30666dee0d4c" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."mission_assignment_status_enum" AS ENUM('UNCOMPLETED', 'COMPLETED')`,
      `CREATE TABLE "mission_assignment" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "mission_id" integer NOT NULL, "available_from" TIMESTAMP WITH TIME ZONE NOT NULL, "available_until" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."mission_assignment_status_enum" NOT NULL DEFAULT 'UNCOMPLETED', "completed_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_928821e07e9e1233df40f09396b" PRIMARY KEY ("id"))`,
      `CREATE TABLE "post_like" ("id" SERIAL NOT NULL, "post_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_0e95caa8a8b56d7797569cf5dc6" PRIMARY KEY ("id"))`,
      `CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."resource_type_enum" AS ENUM('ARTICLE', 'VIDEO', 'AUDIO')`,
      `CREATE TYPE "public"."resource_category_enum" AS ENUM('DEPRESSION', 'ANXIETY', 'STRESS', 'OTHER')`,
      `CREATE TABLE "resource" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "type" "public"."resource_type_enum" NOT NULL, "category" "public"."resource_category_enum" NOT NULL, "url" character varying NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."s3_queue_status_enum" AS ENUM('PENDING', 'PROCESSING')`,
      `CREATE TABLE "s3_queue" ("id" SERIAL NOT NULL, "attachment_key" character varying NOT NULL, "status" "public"."s3_queue_status_enum" NOT NULL DEFAULT 'PENDING', "attempt_count" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "processing_started_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_dcc0419f8476fed8fa3b75dcd79" PRIMARY KEY ("id"))`,
      `CREATE TYPE "public"."report_range_enum" AS ENUM('POST', 'COMMENT')`,
      `CREATE TABLE "report" ("id" SERIAL NOT NULL, "reason" character varying NOT NULL, "range" "public"."report_range_enum" NOT NULL, "post_id" integer, "comment_id" integer, "user_id" integer, "is_processed" boolean NOT NULL DEFAULT false, "processed_at" TIMESTAMP WITH TIME ZONE, "processed_by_id" integer, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_99e4d0bea58cba73c57f935a546" PRIMARY KEY ("id"))`,
      `ALTER TABLE "user_profile" ADD CONSTRAINT "FK_eee360f3bff24af1b6890765201" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "post_comment" ADD CONSTRAINT "FK_36bc7eb15ed86f27d6898f21298" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "post_comment" ADD CONSTRAINT "FK_3d8d4bad8fd4f99bb86cd83026b" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      `ALTER TABLE "post_comment" ADD CONSTRAINT "FK_c85e1efcaaab3ec75115017e1eb" FOREIGN KEY ("deleted_by") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      `ALTER TABLE "post" ADD CONSTRAINT "FK_2f1a9ca8908fc8168bc18437f62" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "attachment" ADD CONSTRAINT "FK_aa385b9808cc7a076ae65ace356" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "counsel" ADD CONSTRAINT "FK_56009be14661558ca4843320e7b" FOREIGN KEY ("author_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "counsel" ADD CONSTRAINT "FK_e6da8a3b074319b2c40bf46eafd" FOREIGN KEY ("responder_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      `ALTER TABLE "diagnosis_entry" ADD CONSTRAINT "FK_f59d463d431aeb9094c2ee788e2" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "mission_assignment" ADD CONSTRAINT "FK_5bf55a2a13996889c92b475e8da" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "mission_assignment" ADD CONSTRAINT "FK_9c8333acc51fd112fb44ed1a932" FOREIGN KEY ("mission_id") REFERENCES "mission"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_a7ec6ac3dc7a05a9648c418f1ad" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "post_like" ADD CONSTRAINT "FK_c635b15915984c8cdb520a1fef3" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_6bbe63d2fe75e7f0ba1710351d4" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "report" ADD CONSTRAINT "FK_265b3dc7c7f692f016115d46a29" FOREIGN KEY ("post_id") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "report" ADD CONSTRAINT "FK_8bb2bc4a3d9c55e031bc5d015c5" FOREIGN KEY ("comment_id") REFERENCES "post_comment"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
      `ALTER TABLE "report" ADD CONSTRAINT "FK_c6686efa4cd49fa9a429f01bac8" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      `ALTER TABLE "report" ADD CONSTRAINT "FK_0d4085b4c9e740ad9a6df908bbe" FOREIGN KEY ("processed_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    ];

    for (const query of queries) {
      await queryRunner.query(query);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "report", "s3_queue", "resource", "refresh_token", "post_like", "mission_assignment", "mission", "diagnosis_entry", "counsel", "attachment", "post", "post_comment", "user_profile", "user" CASCADE`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."report_range_enum"`);
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."s3_queue_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."resource_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."resource_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."mission_assignment_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."mission_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."counsel_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."post_category_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE IF EXISTS "public"."post_comment_deletion_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."user_role_enum"`);
  }
}
