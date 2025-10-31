-- =====================================================
-- Script PASSO A PASSO para criar banco de dados
-- Executar cada seção separadamente
-- =====================================================

-- PASSO 1: Criar tabelas básicas primeiro
CREATE TABLE IF NOT EXISTS "Organizations" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Cnpj" text NOT NULL,
    "Address" text NOT NULL,
    "City" text NOT NULL,
    "State" text NOT NULL,
    "ZipCode" text NOT NULL,
    "Phone" text NOT NULL,
    "Email" text NOT NULL,
    "Timezone" text NOT NULL DEFAULT 'America/Sao_Paulo',
    "Currency" text NOT NULL DEFAULT 'BRL',
    "Language" text NOT NULL DEFAULT 'pt-BR',
    "IsActive" boolean NOT NULL DEFAULT true,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Organizations" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Color" text NOT NULL DEFAULT '#000000',
    "AccessLevel" integer NOT NULL DEFAULT 1,
    "IsSystemRole" boolean NOT NULL DEFAULT false,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Roles" PRIMARY KEY ("Id")
);

CREATE TABLE IF NOT EXISTS "Users" (
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

CREATE TABLE IF NOT EXISTS "UserOrganizations" (
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

-- PASSO 2: Criar tabela People
CREATE TABLE IF NOT EXISTS "People" (
    "Id" uuid NOT NULL,
    "FirstName" text NOT NULL,
    "LastName" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text NOT NULL,
    "Document" text NOT NULL,
    "PixKey" text,
    "Address" text,
    "City" text,
    "State" text,
    "ZipCode" text,
    "BirthDate" timestamp with time zone,
    "ProfilePicture" text,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_People" PRIMARY KEY ("Id")
);

-- PASSO 3: Criar tabela Events
CREATE TABLE IF NOT EXISTS "Events" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Location" text NOT NULL,
    "Address" text NOT NULL,
    "City" text NOT NULL,
    "State" text NOT NULL,
    "Capacity" integer NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "SetupDate" timestamp with time zone,
    "TeardownDate" timestamp with time zone,
    "Status" integer NOT NULL DEFAULT 0,
    "TicketPrice" decimal(18,2),
    "ImageUrl" text,
    "BannerUrl" text,
    "Website" text,
    "SocialMedia" text,
    "TotalBudget" decimal(18,2),
    "TotalCost" decimal(18,2),
    "TotalRevenue" decimal(18,2),
    "Profit" decimal(18,2),
    "ROI" decimal(18,2),
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Events" PRIMARY KEY ("Id")
);

-- PASSO 4: Criar tabela EventPromoters
CREATE TABLE IF NOT EXISTS "EventPromoters" (
    "Id" uuid NOT NULL,
    "PromoterCode" text,
    "UTMCode" text,
    "CommissionRate" decimal(5,2) NOT NULL DEFAULT 0,
    "TotalSales" decimal(18,2) NOT NULL DEFAULT 0,
    "TotalCommission" decimal(18,2) NOT NULL DEFAULT 0,
    "Status" integer NOT NULL DEFAULT 0,
    "EventId" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "CampaignId" uuid,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventPromoters" PRIMARY KEY ("Id")
);

-- PASSO 5: Criar índices básicos
CREATE UNIQUE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users" ("Email");
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserOrganizations_UserId_OrganizationId" ON "UserOrganizations" ("UserId", "OrganizationId");
CREATE INDEX IF NOT EXISTS "IX_Events_OrganizationId" ON "Events" ("OrganizationId");
CREATE INDEX IF NOT EXISTS "IX_EventPromoters_EventId" ON "EventPromoters" ("EventId");
CREATE INDEX IF NOT EXISTS "IX_EventPromoters_UserId" ON "EventPromoters" ("UserId");

-- PASSO 6: Criar foreign keys básicas
ALTER TABLE "Roles" 
    ADD CONSTRAINT "FK_Roles_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Roles_RoleId" 
    FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE;

ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "Events" 
    ADD CONSTRAINT "FK_Events_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

-- PASSO 7: Inserir dados iniciais
INSERT INTO "Organizations" ("Id", "Name", "Cnpj", "Address", "City", "State", "ZipCode", "Phone", "Email", "IsActive", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Pulse8', '12345678000199', 'Rua Exemplo, 123', 'São Paulo', 'SP', '01234567', '11999999999', 'contato@pulse8.com', true, false, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Roles" ("Id", "Name", "Description", "Color", "AccessLevel", "IsSystemRole", "OrganizationId", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Admin', 'Administrador do sistema', '#FF0000', 10, true, (SELECT "Id" FROM "Organizations" LIMIT 1), false, NOW())
ON CONFLICT DO NOTHING;

-- PASSO 8: Verificar estrutura criada
SELECT 
    'Estrutura básica criada com sucesso!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN ('Organizations', 'Roles', 'Users', 'UserOrganizations', 'People', 'Events', 'EventPromoters');

-- =====================================================
-- FIM DO SCRIPT PASSO A PASSO
-- =====================================================

