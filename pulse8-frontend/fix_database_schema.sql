-- =====================================================
-- Script para corrigir o esquema do banco de dados
-- Remove OrganizationId e RoleId da tabela Users
-- Cria tabela UserOrganizations
-- =====================================================

-- 1. Primeiro, vamos criar a tabela UserOrganizations
CREATE TABLE IF NOT EXISTS "UserOrganizations" (
    "Id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "UserId" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "JoinedAt" timestamp with time zone,
    "LeftAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone NOT NULL DEFAULT (now()),
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    CONSTRAINT "PK_UserOrganizations" PRIMARY KEY ("Id")
);

-- 2. Criar índices para UserOrganizations
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserOrganizations_UserId_OrganizationId" 
ON "UserOrganizations" ("UserId", "OrganizationId");

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_UserId" 
ON "UserOrganizations" ("UserId");

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_OrganizationId" 
ON "UserOrganizations" ("OrganizationId");

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_RoleId" 
ON "UserOrganizations" ("RoleId");

-- 3. Migrar dados existentes de Users para UserOrganizations
-- (apenas se existirem usuários com OrganizationId e RoleId válidos)
INSERT INTO "UserOrganizations" ("UserId", "OrganizationId", "RoleId", "Status", "JoinedAt", "CreatedAt", "CreatedBy")
SELECT 
    "Id" as "UserId",
    "OrganizationId",
    "RoleId",
    0 as "Status", -- Active
    "CreatedAt" as "JoinedAt",
    "CreatedAt",
    NULL as "CreatedBy" -- Deixar como NULL pois é text na Users mas uuid na UserOrganizations
FROM "Users" 
WHERE "OrganizationId" IS NOT NULL 
  AND "RoleId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "UserOrganizations" uo 
    WHERE uo."UserId" = "Users"."Id"
  );

-- 4. Remover as foreign keys primeiro
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Organizations_OrganizationId";
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Roles_RoleId";

-- 5. Remover os índices das colunas que serão removidas
DROP INDEX IF EXISTS "IX_Users_OrganizationId";
DROP INDEX IF EXISTS "IX_Users_RoleId";

-- 6. Remover as colunas OrganizationId e RoleId da tabela Users
ALTER TABLE "Users" DROP COLUMN IF EXISTS "OrganizationId";
ALTER TABLE "Users" DROP COLUMN IF EXISTS "RoleId";

-- 7. Adicionar foreign keys para UserOrganizations
ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Roles_RoleId" 
FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE;

-- 8. Verificar se a migração foi bem-sucedida
SELECT 
    'Migration completed successfully' as status,
    (SELECT COUNT(*) FROM "UserOrganizations") as user_organizations_count,
    (SELECT COUNT(*) FROM "Users") as users_count;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
