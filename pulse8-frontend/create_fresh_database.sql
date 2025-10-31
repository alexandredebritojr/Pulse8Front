-- =====================================================
-- Script para criar banco de dados limpo com nova estrutura
-- =====================================================

-- 1. Criar tabela Organizations
CREATE TABLE "Organizations" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Address" text,
    "Phone" text,
    "Email" text,
    "Website" text,
    "Logo" text,
    "Status" integer NOT NULL DEFAULT 0,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Organizations" PRIMARY KEY ("Id")
);

-- 2. Criar tabela Roles
CREATE TABLE "Roles" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "IsSystemRole" boolean NOT NULL DEFAULT false,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

-- 3. Criar tabela Users (SEM OrganizationId e RoleId)
CREATE TABLE "Users" (
    "Id" uuid NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "PasswordHash" text NOT NULL,
    "Phone" text,
    "Document" text,
    "Status" integer NOT NULL DEFAULT 0,
    "LastLoginAt" timestamp with time zone,
    "ProfilePicture" text,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- 4. Criar tabela UserOrganizations (nova estrutura)
CREATE TABLE "UserOrganizations" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "JoinedAt" timestamp with time zone,
    "LeftAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_UserOrganizations" PRIMARY KEY ("Id")
);

-- 5. Criar tabela Events
CREATE TABLE "Events" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Location" text,
    "Address" text,
    "City" text,
    "State" text,
    "Country" text,
    "ZipCode" text,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Events" PRIMARY KEY ("Id")
);

-- 6. Criar tabela Campaigns
CREATE TABLE "Campaigns" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Budget" decimal(18,2) NOT NULL DEFAULT 0,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Campaigns" PRIMARY KEY ("Id")
);

-- 7. Criar tabela EventPromoters (com UserId em vez de PersonId)
CREATE TABLE "EventPromoters" (
    "Id" uuid NOT NULL,
    "PromoterCode" text,
    "UTMCode" text,
    "CommissionRate" decimal(5,2) NOT NULL DEFAULT 0,
    "TotalSales" decimal(18,2) NOT NULL DEFAULT 0,
    "TotalCommission" decimal(18,2) NOT NULL DEFAULT 0,
    "Status" integer NOT NULL DEFAULT 0,
    "EventId" uuid NOT NULL,
    "UserId" uuid NOT NULL,  -- MUDANÇA: Era PersonId
    "CampaignId" uuid,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventPromoters" PRIMARY KEY ("Id")
);

-- 8. Criar índices
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_Document" ON "Users" ("Document");
CREATE UNIQUE INDEX "IX_UserOrganizations_UserId_OrganizationId" ON "UserOrganizations" ("UserId", "OrganizationId");
CREATE INDEX "IX_Events_OrganizationId" ON "Events" ("OrganizationId");
CREATE INDEX "IX_Events_Status" ON "Events" ("Status");
CREATE INDEX "IX_Events_OrganizationId_Status" ON "Events" ("OrganizationId", "Status");
CREATE INDEX "IX_Campaigns_OrganizationId" ON "Campaigns" ("OrganizationId");
CREATE INDEX "IX_EventPromoters_EventId" ON "EventPromoters" ("EventId");
CREATE INDEX "IX_EventPromoters_UserId" ON "EventPromoters" ("UserId");
CREATE INDEX "IX_EventPromoters_CampaignId" ON "EventPromoters" ("CampaignId");

-- 9. Criar foreign keys
ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Roles_RoleId" 
    FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE;

ALTER TABLE "Events" 
    ADD CONSTRAINT "FK_Events_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "Campaigns" 
    ADD CONSTRAINT "FK_Campaigns_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Campaigns_CampaignId" 
    FOREIGN KEY ("CampaignId") REFERENCES "Campaigns" ("Id") ON DELETE SET NULL;

-- 10. Inserir dados iniciais
INSERT INTO "Organizations" ("Id", "Name", "Description", "Status", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Pulse8', 'Organização principal do Pulse8', 0, false, NOW());

INSERT INTO "Roles" ("Id", "Name", "Description", "IsSystemRole", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Admin', 'Administrador do sistema', true, false, NOW());

-- 11. Verificar estrutura criada
SELECT 
    'Estrutura criada com sucesso!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN ('Users', 'Organizations', 'Roles', 'UserOrganizations', 'Events', 'Campaigns', 'EventPromoters');

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

