import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1770312858107 implements MigrationInterface {
    name = 'InitialMigration1770312858107'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "FK_2b9f70ffaddf3102ab6bc072e9e"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "FK_f9bef39c540fc7a79b626663bb1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9bef39c540fc7a79b626663bb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b9f70ffaddf3102ab6bc072e9"`);
        await queryRunner.query(`CREATE TABLE "task_status_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "language_id" integer, "task_status_id" integer, CONSTRAINT "PK_bef2fdedfde7507460a60cd7b90" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_status" ("id" SERIAL NOT NULL, "color" character varying NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "is_default" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_b8747cc6a41b6cef4639babf61d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "task_category_translation" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text, "language_id" integer, "task_category_id" integer, CONSTRAINT "PK_17c06b53e88f42953aac52fd9f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_2c87cf4bfb2bbe96a89093a7537"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_f9bef39c540fc7a79b626663bb1" PRIMARY KEY ("task_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_f9bef39c540fc7a79b626663bb1"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_5a2a57aed53e11558e410ddb44d" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "color" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "task_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_5a2a57aed53e11558e410ddb44d"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_c74db562070796f6fcdda5cbcf5" PRIMARY KEY ("id", "task_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "category_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_c74db562070796f6fcdda5cbcf5"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_d9862de51104d0eef79587e5fed" PRIMARY KEY ("id", "task_id", "category_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_d9862de51104d0eef79587e5fed"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_2c87cf4bfb2bbe96a89093a7537" PRIMARY KEY ("task_id", "category_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_f9bef39c540fc7a79b626663bb" ON "task_category" ("task_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2b9f70ffaddf3102ab6bc072e9" ON "task_category" ("category_id") `);
        await queryRunner.query(`ALTER TABLE "task_status_translation" ADD CONSTRAINT "FK_3df13126bdf9fe8f353d005d336" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_status_translation" ADD CONSTRAINT "FK_4f5800db2ac5c03f274bb613f71" FOREIGN KEY ("task_status_id") REFERENCES "task_status"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_category_translation" ADD CONSTRAINT "FK_3b2c75ecf0a76f08f0a1176c071" FOREIGN KEY ("language_id") REFERENCES "language"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_category_translation" ADD CONSTRAINT "FK_85d07a5bb361f6edbf16d677afc" FOREIGN KEY ("task_category_id") REFERENCES "task_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "FK_f9bef39c540fc7a79b626663bb1" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "FK_2b9f70ffaddf3102ab6bc072e9e" FOREIGN KEY ("category_id") REFERENCES "project_category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "FK_2b9f70ffaddf3102ab6bc072e9e"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "FK_f9bef39c540fc7a79b626663bb1"`);
        await queryRunner.query(`ALTER TABLE "task_category_translation" DROP CONSTRAINT "FK_85d07a5bb361f6edbf16d677afc"`);
        await queryRunner.query(`ALTER TABLE "task_category_translation" DROP CONSTRAINT "FK_3b2c75ecf0a76f08f0a1176c071"`);
        await queryRunner.query(`ALTER TABLE "task_status_translation" DROP CONSTRAINT "FK_4f5800db2ac5c03f274bb613f71"`);
        await queryRunner.query(`ALTER TABLE "task_status_translation" DROP CONSTRAINT "FK_3df13126bdf9fe8f353d005d336"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2b9f70ffaddf3102ab6bc072e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9bef39c540fc7a79b626663bb"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_2c87cf4bfb2bbe96a89093a7537"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_d9862de51104d0eef79587e5fed" PRIMARY KEY ("id", "task_id", "category_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_d9862de51104d0eef79587e5fed"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_c74db562070796f6fcdda5cbcf5" PRIMARY KEY ("id", "task_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "category_id"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_c74db562070796f6fcdda5cbcf5"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_5a2a57aed53e11558e410ddb44d" PRIMARY KEY ("id")`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "task_id"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "color"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_5a2a57aed53e11558e410ddb44d"`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "task_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_f9bef39c540fc7a79b626663bb1" PRIMARY KEY ("task_id")`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD "category_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "task_category" DROP CONSTRAINT "PK_f9bef39c540fc7a79b626663bb1"`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "PK_2c87cf4bfb2bbe96a89093a7537" PRIMARY KEY ("category_id", "task_id")`);
        await queryRunner.query(`DROP TABLE "task_category_translation"`);
        await queryRunner.query(`DROP TABLE "task_status"`);
        await queryRunner.query(`DROP TABLE "task_status_translation"`);
        await queryRunner.query(`CREATE INDEX "IDX_2b9f70ffaddf3102ab6bc072e9" ON "task_category" ("category_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_f9bef39c540fc7a79b626663bb" ON "task_category" ("task_id") `);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "FK_f9bef39c540fc7a79b626663bb1" FOREIGN KEY ("task_id") REFERENCES "task"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "task_category" ADD CONSTRAINT "FK_2b9f70ffaddf3102ab6bc072e9e" FOREIGN KEY ("category_id") REFERENCES "project_category"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
