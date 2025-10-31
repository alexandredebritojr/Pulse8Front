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

