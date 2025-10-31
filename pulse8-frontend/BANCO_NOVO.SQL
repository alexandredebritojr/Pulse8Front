-- =====================================================
-- Script COMPLETO para criar banco de dados com TODAS as entidades
-- Baseado em todas as entidades do projeto Pulse8
-- =====================================================

-- 1. ORGANIZATIONS
CREATE TABLE "Organizations" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Cnpj" text NOT NULL,
    "Address" text NOT NULL,
    "City" text NOT NULL,
    "State" text NOT NULL,
    "ZipCode" text NOT NULL,
    "Phone" text NOT NULL,
    "Email" text NOT NULL,
    "IsActive" boolean NOT NULL DEFAULT true,    
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    CONSTRAINT "PK_Organizations" PRIMARY KEY ("Id")
);


-- 3. USERS (SEM OrganizationId e RoleId - nova estrutura)
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
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- 4. USERORGANIZATIONS (nova tabela de relacionamento)
CREATE TABLE "UserOrganizations" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "Type" integer NOT NULL DEFAULT 0,
    "Status" integer NOT NULL DEFAULT 0,
    CONSTRAINT "PK_UserOrganizations" PRIMARY KEY ("Id")
);

-- 8. EVENTS
CREATE TABLE "Events" (
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
    "Status" integer NOT NULL DEFAULT 0,
    "TicketPrice" decimal(18,2),
    "ImageUrl" text,
    "BannerUrl" text,
    "Website" text,
    "SocialMedia" text,
    "TotalBudget" decimal(18,2),
    "TotalCost" decimal(18,2),    
    "OrganizationId" uuid NOT null,
    CONSTRAINT "PK_Events" PRIMARY KEY ("Id")
);

-- 9. CAMPAIGNS
CREATE TABLE "MarketingCampaigns" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Type" integer NOT NULL,
    "CommissionValue" decimal(18,2) NOT NULL,
    "CommissionRate" decimal(5,2) NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "Notes" text,
    "Budget" decimal(18,2) NOT NULL,
    "EventId" uuid NOT NULL,
    CONSTRAINT "PK_MarketingCampaigns" PRIMARY KEY ("Id")
);

-- 12. EVENTPROMOTERS (com UserId em vez de PersonId)
CREATE TABLE "Promoters" (
    "Id" uuid NOT NULL,
    "PromoterCode" text,
    "UTMCode" text,
    "CommissionRate" decimal(5,2) NOT NULL DEFAULT 0,
    "TotalSales" decimal(18,2) NOT NULL DEFAULT 0,
    "TotalCommission" decimal(18,2) NOT NULL DEFAULT 0,
    "Status" integer NOT NULL DEFAULT 0,
    "EventId" uuid NOT NULL,
    "UserId" uuid NOT NULL,  -- MUDANÇA: Era PersonId
    "MarketingCampaignId" uuid,
    CONSTRAINT "PK_EventPromoters" PRIMARY KEY ("Id")
);

-- 10. PEOPLE
CREATE TABLE "People" (
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
    "Role" text,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "EventId" uuid NOT NULL, 
    CONSTRAINT "PK_People" PRIMARY KEY ("Id")
);

-- 14. EVENTGUESTS
CREATE TABLE "Guests" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text,
    "Document" text,
    "CheckInDate" timestamp with time zone,
    "EventId" uuid NOT NULL, 
    CONSTRAINT "PK_EventGuests" PRIMARY KEY ("Id")
);

-- 15. SUPPLIERS
CREATE TABLE "Suppliers" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Document" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text NOT NULL,
    "Address" text,
    "City" text,
    "State" text,
    "ZipCode" text,
    "PixKey" text,
    "BankAccount" text,
    "Notes" text,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    CONSTRAINT "PK_Suppliers" PRIMARY KEY ("Id")
);

-- 19. EVENTSCHEDULES
CREATE TABLE "Schedules" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text,
    "StartTime" timestamp with time zone NOT NULL,
    "EndTime" timestamp with time zone NOT NULL,
    "Location" text,
    "EventId" uuid NOT NULL,
    CONSTRAINT "PK_EventSchedules" PRIMARY KEY ("Id")
);


-- 21. MARKETINGASSETS
CREATE TABLE "MarketingAssets" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Type" text NOT NULL,
    "FilePath" text NOT NULL,
    "FileSize" bigint NOT NULL,
    "MimeType" text NOT NULL,
    "OrganizationId" uuid NOT NULL,
    "EventId" uuid NOT NULL,
    CONSTRAINT "PK_MarketingAssets" PRIMARY KEY ("Id")
);

-- 23. MARKETINGPOSTS
CREATE TABLE "MarketingPosts" (
    "Id" uuid NOT NULL,
    "Content" text NOT NULL,
    "Platform" text NOT NULL,
    "ScheduledDate" timestamp with time zone,
    "PublishedDate" timestamp with time zone,
    "Status" integer NOT NULL DEFAULT 0,
    "MarketingCampaignId" uuid NOT NULL,
    CONSTRAINT "PK_MarketingPosts" PRIMARY KEY ("Id")
);

-- 26. BUDGETS
CREATE TABLE "Budgets" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text,
    "Amount" decimal(18,2) NOT NULL,
    "Spent" decimal(18,2) NOT NULL DEFAULT 0,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    CONSTRAINT "PK_Budgets" PRIMARY KEY ("Id")
);

-- 27. EVENTEXPENSES
CREATE TABLE "Expenses" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "DueDate" timestamp with time zone NOT NULL,
    "PaidDate" timestamp with time zone,
    "Status" integer NOT NULL DEFAULT 0,
    "InvoiceNumber" text,
    "Notes" text,
    "EventId" uuid NOT NULL,
    "SupplierId" uuid,
    "Type" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    CONSTRAINT "PK_EventExpenses" PRIMARY KEY ("Id")
);

-- 28. EVENTREVENUES
CREATE TABLE "Revenues" (
    "Id" uuid NOT NULL,
    "Source" text NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "Reference" text,
    "Notes" text,
    "EventId" uuid NOT NULL,
    "OrganizationId" uuid NOT NULL,
    CONSTRAINT "PK_EventRevenues" PRIMARY KEY ("Id")
);

-- =====================================================
-- Script OTIMIZADO - Apenas FKs necessárias
-- =====================================================

-- REMOVER FKs desnecessárias (se existirem)
ALTER TABLE "Guests" DROP CONSTRAINT IF EXISTS "FK_Guests_Organizations_OrganizationId";
ALTER TABLE "Schedules" DROP CONSTRAINT IF EXISTS "FK_Schedules_Organizations_OrganizationId";
ALTER TABLE "MarketingPosts" DROP CONSTRAINT IF EXISTS "FK_MarketingPosts_Organizations_OrganizationId";
ALTER TABLE "Promoters" DROP CONSTRAINT IF EXISTS "FK_Promoters_Organizations_OrganizationId";

-- REMOVER colunas desnecessárias (se existirem)
ALTER TABLE "Guests" DROP COLUMN IF EXISTS "OrganizationId";
ALTER TABLE "Schedules" DROP COLUMN IF EXISTS "OrganizationId";
ALTER TABLE "MarketingPosts" DROP COLUMN IF EXISTS "OrganizationId";
ALTER TABLE "Promoters" DROP COLUMN IF EXISTS "OrganizationId";

-- MANTER apenas as FKs necessárias:

-- Events (DEVE ter FK com Organization)
ALTER TABLE "Events" 
    ADD CONSTRAINT "FK_Events_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- People (DEVE ter FK com Organization)
ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Suppliers (DEVE ter FK com Organization)
ALTER TABLE "Suppliers" 
    ADD CONSTRAINT "FK_Suppliers_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Budgets (DEVE ter FK com Organization)
ALTER TABLE "Budgets" 
    ADD CONSTRAINT "FK_Budgets_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Expenses (DEVE ter FK com Organization)
ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Revenues (DEVE ter FK com Organization)
ALTER TABLE "Revenues" 
    ADD CONSTRAINT "FK_Revenues_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- MarketingAssets (DEVE ter FK com Organization)
ALTER TABLE "MarketingAssets" 
    ADD CONSTRAINT "FK_MarketingAssets_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- FKs por relacionamento direto (NÃO com Organization):

-- MarketingCampaigns -> Events
ALTER TABLE "MarketingCampaigns" 
    ADD CONSTRAINT "FK_MarketingCampaigns_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Promoters -> Events + Users
ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_MarketingCampaigns_MarketingCampaignId" 
    FOREIGN KEY ("MarketingCampaignId") REFERENCES "MarketingCampaigns" ("Id") ON DELETE SET NULL;

-- People -> Events (além de Organization)
ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Guests -> Events
ALTER TABLE "Guests" 
    ADD CONSTRAINT "FK_Guests_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Schedules -> Events
ALTER TABLE "Schedules" 
    ADD CONSTRAINT "FK_Schedules_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- MarketingAssets -> Events (além de Organization)
ALTER TABLE "MarketingAssets" 
    ADD CONSTRAINT "FK_MarketingAssets_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- MarketingPosts -> MarketingCampaigns
ALTER TABLE "MarketingPosts" 
    ADD CONSTRAINT "FK_MarketingPosts_MarketingCampaigns_MarketingCampaignId" 
    FOREIGN KEY ("MarketingCampaignId") REFERENCES "MarketingCampaigns" ("Id") ON DELETE CASCADE;

-- Expenses -> Events + Suppliers
ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Suppliers_SupplierId" 
    FOREIGN KEY ("SupplierId") REFERENCES "Suppliers" ("Id") ON DELETE SET NULL;

-- Revenues -> Events (além de Organization)
ALTER TABLE "Revenues" 
    ADD CONSTRAINT "FK_Revenues_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- UserOrganizations (relacionamento User-Organization)
ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'FKs otimizadas criadas com sucesso!' as status,
    COUNT(*) as total_fks
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name IN (
    'Events', 'People', 'Suppliers', 'Budgets', 'Expenses', 'Revenues', 
    'MarketingAssets', 'MarketingCampaigns', 'Promoters', 'Guests', 
    'Schedules', 'MarketingPosts', 'UserOrganizations'
  );

-- =====================================================
-- FIM DO SCRIPT OTIMIZADO
-- =====================================================