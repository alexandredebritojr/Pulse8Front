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

-- 2. ROLES
CREATE TABLE "Roles" (
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
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Users" PRIMARY KEY ("Id")
);

-- 4. USERORGANIZATIONS (nova tabela de relacionamento)
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

-- 5. PERMISSIONS
CREATE TABLE "Permissions" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Module" text NOT NULL,
    "Action" text NOT NULL,
    "Resource" text NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Permissions" PRIMARY KEY ("Id")
);

-- 6. ROLEPERMISSIONS
CREATE TABLE "RolePermissions" (
    "Id" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "PermissionId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_RolePermissions" PRIMARY KEY ("Id")
);

-- 7. USERPERMISSIONS
CREATE TABLE "UserPermissions" (
    "Id" uuid NOT NULL,
    "UserId" uuid NOT NULL,
    "PermissionId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_UserPermissions" PRIMARY KEY ("Id")
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

-- 9. CAMPAIGNS
CREATE TABLE "Campaigns" (
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
    "EventId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Campaigns" PRIMARY KEY ("Id")
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
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_People" PRIMARY KEY ("Id")
);

-- 11. PERSONROLES
CREATE TABLE "PersonRoles" (
    "Id" uuid NOT NULL,
    "PersonId" uuid NOT NULL,
    "RoleId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_PersonRoles" PRIMARY KEY ("Id")
);

-- 12. EVENTPROMOTERS (com UserId em vez de PersonId)
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

-- 13. PROMOTERSALES
CREATE TABLE "PromoterSales" (
    "Id" uuid NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "Commission" decimal(18,2) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "EventPromoterId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_PromoterSales" PRIMARY KEY ("Id")
);

-- 14. EVENTGUESTS
CREATE TABLE "EventGuests" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Email" text NOT NULL,
    "Phone" text,
    "Document" text,
    "CheckInDate" timestamp with time zone,
    "EventId" uuid NOT NULL,
    "PersonId" uuid,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
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
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Suppliers" PRIMARY KEY ("Id")
);

-- 16. SUPPLIERPROPOSALS
CREATE TABLE "SupplierProposals" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "EventId" uuid NOT NULL,
    "SupplierId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_SupplierProposals" PRIMARY KEY ("Id")
);

-- 17. SUPPLIERPROPOSALATTACHMENTS
CREATE TABLE "SupplierProposalAttachments" (
    "Id" uuid NOT NULL,
    "FileName" text NOT NULL,
    "FilePath" text NOT NULL,
    "FileSize" bigint NOT NULL,
    "MimeType" text NOT NULL,
    "SupplierProposalId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_SupplierProposalAttachments" PRIMARY KEY ("Id")
);

-- 18. EVENTATTACHMENTS
CREATE TABLE "EventAttachments" (
    "Id" uuid NOT NULL,
    "FileName" text NOT NULL,
    "FilePath" text NOT NULL,
    "FileSize" bigint NOT NULL,
    "MimeType" text NOT NULL,
    "EventId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventAttachments" PRIMARY KEY ("Id")
);

-- 19. EVENTSCHEDULES
CREATE TABLE "EventSchedules" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text,
    "StartTime" timestamp with time zone NOT NULL,
    "EndTime" timestamp with time zone NOT NULL,
    "Location" text,
    "EventId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventSchedules" PRIMARY KEY ("Id")
);

-- 20. EVENTTEAMS
CREATE TABLE "EventTeams" (
    "Id" uuid NOT NULL,
    "Role" text NOT NULL,
    "EventId" uuid NOT NULL,
    "PersonId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventTeams" PRIMARY KEY ("Id")
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
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_MarketingAssets" PRIMARY KEY ("Id")
);

-- 22. MARKETINGCAMPAIGNS
CREATE TABLE "MarketingCampaigns" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "StartDate" timestamp with time zone NOT NULL,
    "EndDate" timestamp with time zone NOT NULL,
    "Budget" decimal(18,2) NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_MarketingCampaigns" PRIMARY KEY ("Id")
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
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_MarketingPosts" PRIMARY KEY ("Id")
);

-- 24. SCHEDULES
CREATE TABLE "Schedules" (
    "Id" uuid NOT NULL,
    "Title" text NOT NULL,
    "Description" text,
    "StartTime" timestamp with time zone NOT NULL,
    "EndTime" timestamp with time zone NOT NULL,
    "Location" text,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Schedules" PRIMARY KEY ("Id")
);

-- 25. POSTINGSCHEDULES
CREATE TABLE "PostingSchedules" (
    "Id" uuid NOT NULL,
    "Platform" text NOT NULL,
    "ScheduledDate" timestamp with time zone NOT NULL,
    "Status" integer NOT NULL DEFAULT 0,
    "MarketingPostId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_PostingSchedules" PRIMARY KEY ("Id")
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
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Budgets" PRIMARY KEY ("Id")
);

-- 27. EVENTEXPENSES
CREATE TABLE "EventExpenses" (
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
    "CategoryId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventExpenses" PRIMARY KEY ("Id")
);

-- 28. EVENTREVENUES
CREATE TABLE "EventRevenues" (
    "Id" uuid NOT NULL,
    "Source" text NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "Reference" text,
    "Notes" text,
    "EventId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_EventRevenues" PRIMARY KEY ("Id")
);

-- 29. REVENUES
CREATE TABLE "Revenues" (
    "Id" uuid NOT NULL,
    "Source" text NOT NULL,
    "Amount" decimal(18,2) NOT NULL,
    "Date" timestamp with time zone NOT NULL,
    "Reference" text,
    "Notes" text,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_Revenues" PRIMARY KEY ("Id")
);

-- 30. EXPENSECATEGORIES
CREATE TABLE "ExpenseCategories" (
    "Id" uuid NOT NULL,
    "Name" text NOT NULL,
    "Description" text NOT NULL,
    "Color" text NOT NULL DEFAULT '#000000',
    "IsActive" boolean NOT NULL DEFAULT true,
    "OrganizationId" uuid NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_ExpenseCategories" PRIMARY KEY ("Id")
);

-- 31. AUDITLOGS
CREATE TABLE "AuditLogs" (
    "Id" uuid NOT NULL,
    "EntityName" text NOT NULL,
    "EntityId" text NOT NULL,
    "Action" text NOT NULL,
    "OldValues" text,
    "NewValues" text,
    "UserId" text,
    "Timestamp" timestamp with time zone NOT NULL,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id")
);

-- 32. CHECKINS
CREATE TABLE "CheckIns" (
    "Id" uuid NOT NULL,
    "CheckInTime" timestamp with time zone NOT NULL,
    "CheckOutTime" timestamp with time zone,
    "EventId" uuid NOT NULL,
    "PersonId" uuid,
    "IsDeleted" boolean NOT NULL DEFAULT false,
    "CreatedAt" timestamp with time zone NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "CreatedBy" text,
    "UpdatedBy" text,
    CONSTRAINT "PK_CheckIns" PRIMARY KEY ("Id")
);

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

-- Users
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_Document" ON "Users" ("Document");

-- UserOrganizations
CREATE UNIQUE INDEX "IX_UserOrganizations_UserId_OrganizationId" ON "UserOrganizations" ("UserId", "OrganizationId");

-- Events
CREATE INDEX "IX_Events_OrganizationId" ON "Events" ("OrganizationId");
CREATE INDEX "IX_Events_Status" ON "Events" ("Status");
CREATE INDEX "IX_Events_OrganizationId_Status" ON "Events" ("OrganizationId", "Status");

-- EventPromoters
CREATE INDEX "IX_EventPromoters_EventId" ON "EventPromoters" ("EventId");
CREATE INDEX "IX_EventPromoters_UserId" ON "EventPromoters" ("UserId");
CREATE INDEX "IX_EventPromoters_CampaignId" ON "EventPromoters" ("CampaignId");

-- =====================================================
-- CRIAR FOREIGN KEYS
-- =====================================================

-- UserOrganizations
ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
    ADD CONSTRAINT "FK_UserOrganizations_Roles_RoleId" 
    FOREIGN KEY ("RoleId") REFERENCES "Roles" ("Id") ON DELETE CASCADE;

-- Roles
ALTER TABLE "Roles" 
    ADD CONSTRAINT "FK_Roles_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Events
ALTER TABLE "Events" 
    ADD CONSTRAINT "FK_Events_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Campaigns
ALTER TABLE "Campaigns" 
    ADD CONSTRAINT "FK_Campaigns_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- People
ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- EventPromoters
ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "EventPromoters" 
    ADD CONSTRAINT "FK_EventPromoters_Campaigns_CampaignId" 
    FOREIGN KEY ("CampaignId") REFERENCES "Campaigns" ("Id") ON DELETE SET NULL;

-- E muitas outras foreign keys...

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Organização padrão
INSERT INTO "Organizations" ("Id", "Name", "Cnpj", "Address", "City", "State", "ZipCode", "Phone", "Email", "IsActive", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Pulse8', '12345678000199', 'Rua Exemplo, 123', 'São Paulo', 'SP', '01234567', '11999999999', 'contato@pulse8.com', true, false, NOW());

-- Role padrão
INSERT INTO "Roles" ("Id", "Name", "Description", "Color", "AccessLevel", "IsSystemRole", "OrganizationId", "IsDeleted", "CreatedAt") 
VALUES (gen_random_uuid(), 'Admin', 'Administrador do sistema', '#FF0000', 10, true, (SELECT "Id" FROM "Organizations" LIMIT 1), false, NOW());

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'Estrutura completa criada com sucesso!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN (
    'Organizations', 'Roles', 'Users', 'UserOrganizations', 'Permissions', 'RolePermissions', 'UserPermissions',
    'Events', 'Campaigns', 'People', 'PersonRoles', 'EventPromoters', 'PromoterSales', 'EventGuests',
    'Suppliers', 'SupplierProposals', 'SupplierProposalAttachments', 'EventAttachments', 'EventSchedules',
    'EventTeams', 'MarketingAssets', 'MarketingCampaigns', 'MarketingPosts', 'Schedules', 'PostingSchedules',
    'Budgets', 'EventExpenses', 'EventRevenues', 'Revenues', 'ExpenseCategories', 'AuditLogs', 'CheckIns'
);

-- =====================================================
-- FIM DO SCRIPT COMPLETO
-- =====================================================

