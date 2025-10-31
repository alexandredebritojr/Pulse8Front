-- =====================================================
-- Script COMPLETO com ÍNDICES e FOREIGN KEYS
-- Baseado nas tabelas criadas pelo usuário
-- =====================================================

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

-- Users
CREATE UNIQUE INDEX "IX_Users_Email" ON "Users" ("Email");
CREATE INDEX "IX_Users_Document" ON "Users" ("Document");
CREATE INDEX "IX_Users_Status" ON "Users" ("Status");

-- UserOrganizations
CREATE UNIQUE INDEX "IX_UserOrganizations_UserId_OrganizationId" ON "UserOrganizations" ("UserId", "OrganizationId");
CREATE INDEX "IX_UserOrganizations_UserId" ON "UserOrganizations" ("UserId");
CREATE INDEX "IX_UserOrganizations_OrganizationId" ON "UserOrganizations" ("OrganizationId");
CREATE INDEX "IX_UserOrganizations_Status" ON "UserOrganizations" ("Status");

-- Events
CREATE INDEX "IX_Events_OrganizationId" ON "Events" ("OrganizationId");
CREATE INDEX "IX_Events_Status" ON "Events" ("Status");
CREATE INDEX "IX_Events_StartDate" ON "Events" ("StartDate");
CREATE INDEX "IX_Events_EndDate" ON "Events" ("EndDate");
CREATE INDEX "IX_Events_OrganizationId_Status" ON "Events" ("OrganizationId", "Status");

-- MarketingCampaigns
CREATE INDEX "IX_MarketingCampaigns_EventId" ON "MarketingCampaigns" ("EventId");
CREATE INDEX "IX_MarketingCampaigns_Status" ON "MarketingCampaigns" ("Status");
CREATE INDEX "IX_MarketingCampaigns_StartDate" ON "MarketingCampaigns" ("StartDate");
CREATE INDEX "IX_MarketingCampaigns_EndDate" ON "MarketingCampaigns" ("EndDate");

-- Promoters
CREATE INDEX "IX_Promoters_EventId" ON "Promoters" ("EventId");
CREATE INDEX "IX_Promoters_UserId" ON "Promoters" ("UserId");
CREATE INDEX "IX_Promoters_MarketingCampaignId" ON "Promoters" ("MarketingCampaignId");
CREATE INDEX "IX_Promoters_Status" ON "Promoters" ("Status");
CREATE INDEX "IX_Promoters_PromoterCode" ON "Promoters" ("PromoterCode");

-- People
CREATE INDEX "IX_People_OrganizationId" ON "People" ("OrganizationId");
CREATE INDEX "IX_People_EventId" ON "People" ("EventId");
CREATE INDEX "IX_People_Email" ON "People" ("Email");
CREATE INDEX "IX_People_Document" ON "People" ("Document");
CREATE INDEX "IX_People_Status" ON "People" ("Status");
CREATE INDEX "IX_People_Role" ON "People" ("Role");

-- Guests
CREATE INDEX "IX_Guests_EventId" ON "Guests" ("EventId");
CREATE INDEX "IX_Guests_Email" ON "Guests" ("Email");
CREATE INDEX "IX_Guests_Document" ON "Guests" ("Document");
CREATE INDEX "IX_Guests_CheckInDate" ON "Guests" ("CheckInDate");

-- Suppliers
CREATE INDEX "IX_Suppliers_OrganizationId" ON "Suppliers" ("OrganizationId");
CREATE INDEX "IX_Suppliers_Email" ON "Suppliers" ("Email");
CREATE INDEX "IX_Suppliers_Document" ON "Suppliers" ("Document");
CREATE INDEX "IX_Suppliers_Status" ON "Suppliers" ("Status");

-- Schedules
CREATE INDEX "IX_Schedules_EventId" ON "Schedules" ("EventId");
CREATE INDEX "IX_Schedules_StartTime" ON "Schedules" ("StartTime");
CREATE INDEX "IX_Schedules_EndTime" ON "Schedules" ("EndTime");

-- MarketingAssets
CREATE INDEX "IX_MarketingAssets_OrganizationId" ON "MarketingAssets" ("OrganizationId");
CREATE INDEX "IX_MarketingAssets_EventId" ON "MarketingAssets" ("EventId");
CREATE INDEX "IX_MarketingAssets_Type" ON "MarketingAssets" ("Type");

-- MarketingPosts
CREATE INDEX "IX_MarketingPosts_MarketingCampaignId" ON "MarketingPosts" ("MarketingCampaignId");
CREATE INDEX "IX_MarketingPosts_Status" ON "MarketingPosts" ("Status");
CREATE INDEX "IX_MarketingPosts_Platform" ON "MarketingPosts" ("Platform");
CREATE INDEX "IX_MarketingPosts_ScheduledDate" ON "MarketingPosts" ("ScheduledDate");

-- Budgets
CREATE INDEX "IX_Budgets_OrganizationId" ON "Budgets" ("OrganizationId");
CREATE INDEX "IX_Budgets_Status" ON "Budgets" ("Status");
CREATE INDEX "IX_Budgets_StartDate" ON "Budgets" ("StartDate");
CREATE INDEX "IX_Budgets_EndDate" ON "Budgets" ("EndDate");

-- Expenses
CREATE INDEX "IX_Expenses_EventId" ON "Expenses" ("EventId");
CREATE INDEX "IX_Expenses_SupplierId" ON "Expenses" ("SupplierId");
CREATE INDEX "IX_Expenses_OrganizationId" ON "Expenses" ("OrganizationId");
CREATE INDEX "IX_Expenses_Status" ON "Expenses" ("Status");
CREATE INDEX "IX_Expenses_DueDate" ON "Expenses" ("DueDate");
CREATE INDEX "IX_Expenses_Type" ON "Expenses" ("Type");

-- Revenues
CREATE INDEX "IX_Revenues_EventId" ON "Revenues" ("EventId");
CREATE INDEX "IX_Revenues_OrganizationId" ON "Revenues" ("OrganizationId");
CREATE INDEX "IX_Revenues_Date" ON "Revenues" ("Date");
CREATE INDEX "IX_Revenues_Source" ON "Revenues" ("Source");

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

-- Events
ALTER TABLE "Events" 
    ADD CONSTRAINT "FK_Events_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- MarketingCampaigns
ALTER TABLE "MarketingCampaigns" 
    ADD CONSTRAINT "FK_MarketingCampaigns_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Promoters
ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_Users_UserId" 
    FOREIGN KEY ("UserId") REFERENCES "Users" ("Id") ON DELETE CASCADE;

ALTER TABLE "Promoters" 
    ADD CONSTRAINT "FK_Promoters_MarketingCampaigns_MarketingCampaignId" 
    FOREIGN KEY ("MarketingCampaignId") REFERENCES "MarketingCampaigns" ("Id") ON DELETE SET NULL;

-- People
ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "People" 
    ADD CONSTRAINT "FK_People_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Guests
ALTER TABLE "Guests" 
    ADD CONSTRAINT "FK_Guests_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- Suppliers
ALTER TABLE "Suppliers" 
    ADD CONSTRAINT "FK_Suppliers_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Schedules
ALTER TABLE "Schedules" 
    ADD CONSTRAINT "FK_Schedules_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- MarketingAssets
ALTER TABLE "MarketingAssets" 
    ADD CONSTRAINT "FK_MarketingAssets_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

ALTER TABLE "MarketingAssets" 
    ADD CONSTRAINT "FK_MarketingAssets_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

-- MarketingPosts
ALTER TABLE "MarketingPosts" 
    ADD CONSTRAINT "FK_MarketingPosts_MarketingCampaigns_MarketingCampaignId" 
    FOREIGN KEY ("MarketingCampaignId") REFERENCES "MarketingCampaigns" ("Id") ON DELETE CASCADE;

-- Budgets
ALTER TABLE "Budgets" 
    ADD CONSTRAINT "FK_Budgets_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Expenses
ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Suppliers_SupplierId" 
    FOREIGN KEY ("SupplierId") REFERENCES "Suppliers" ("Id") ON DELETE SET NULL;

ALTER TABLE "Expenses" 
    ADD CONSTRAINT "FK_Expenses_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- Revenues
ALTER TABLE "Revenues" 
    ADD CONSTRAINT "FK_Revenues_Events_EventId" 
    FOREIGN KEY ("EventId") REFERENCES "Events" ("Id") ON DELETE CASCADE;

ALTER TABLE "Revenues" 
    ADD CONSTRAINT "FK_Revenues_Organizations_OrganizationId" 
    FOREIGN KEY ("OrganizationId") REFERENCES "Organizations" ("Id") ON DELETE CASCADE;

-- =====================================================
-- INSERIR DADOS INICIAIS
-- =====================================================

-- Organização padrão
INSERT INTO "Organizations" ("Id", "Name", "Cnpj", "Address", "City", "State", "ZipCode", "Phone", "Email", "IsActive", "CreatedAt") 
VALUES (gen_random_uuid(), 'Pulse8', '12345678000199', 'Rua Exemplo, 123', 'São Paulo', 'SP', '01234567', '11999999999', 'contato@pulse8.com', true, NOW())
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

SELECT 
    'Estrutura completa criada com sucesso!' as status,
    COUNT(*) as total_tables
FROM information_schema.tables 
WHERE table_name IN (
    'Organizations', 'Users', 'UserOrganizations', 'Events', 'MarketingCampaigns', 
    'Promoters', 'People', 'Guests', 'Suppliers', 'Schedules', 'MarketingAssets', 
    'MarketingPosts', 'Budgets', 'Expenses', 'Revenues'
);

-- Verificar foreign keys criadas
SELECT 
    'Foreign Keys criadas:' as info,
    COUNT(*) as total_fks
FROM information_schema.table_constraints 
WHERE constraint_type = 'FOREIGN KEY' 
  AND table_name IN (
    'UserOrganizations', 'Events', 'MarketingCampaigns', 'Promoters', 'People', 
    'Guests', 'Suppliers', 'Schedules', 'MarketingAssets', 'MarketingPosts', 
    'Budgets', 'Expenses', 'Revenues'
  );

-- Verificar índices criados
SELECT 
    'Índices criados:' as info,
    COUNT(*) as total_indexes
FROM information_schema.statistics 
WHERE table_name IN (
    'Users', 'UserOrganizations', 'Events', 'MarketingCampaigns', 'Promoters', 
    'People', 'Guests', 'Suppliers', 'Schedules', 'MarketingAssets', 
    'MarketingPosts', 'Budgets', 'Expenses', 'Revenues'
);

-- =====================================================
-- FIM DO SCRIPT COMPLETO
-- =====================================================

