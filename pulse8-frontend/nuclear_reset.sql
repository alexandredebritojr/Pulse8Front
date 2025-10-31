-- =====================================================
-- SCRIPT NUCLEAR: Remove TUDO e recria do zero
-- =====================================================

-- 1. PARAR todas as conexões ativas
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

-- 2. DROPAR TODAS as tabelas (CUIDADO!)
DROP TABLE IF EXISTS "UserOrganizations" CASCADE;
DROP TABLE IF EXISTS "EventPromoters" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "Organizations" CASCADE;
DROP TABLE IF EXISTS "Roles" CASCADE;
DROP TABLE IF EXISTS "Events" CASCADE;
DROP TABLE IF EXISTS "Campaigns" CASCADE;
DROP TABLE IF EXISTS "People" CASCADE;
DROP TABLE IF EXISTS "PersonRoles" CASCADE;
DROP TABLE IF EXISTS "PromoterSales" CASCADE;
DROP TABLE IF EXISTS "EventGuests" CASCADE;
DROP TABLE IF EXISTS "Suppliers" CASCADE;
DROP TABLE IF EXISTS "SupplierProposals" CASCADE;
DROP TABLE IF EXISTS "SupplierProposalAttachments" CASCADE;
DROP TABLE IF EXISTS "EventAttachments" CASCADE;
DROP TABLE IF EXISTS "EventSchedules" CASCADE;
DROP TABLE IF EXISTS "EventTeams" CASCADE;
DROP TABLE IF EXISTS "MarketingAssets" CASCADE;
DROP TABLE IF EXISTS "MarketingCampaigns" CASCADE;
DROP TABLE IF EXISTS "MarketingPosts" CASCADE;
DROP TABLE IF EXISTS "Schedules" CASCADE;
DROP TABLE IF EXISTS "PostingSchedules" CASCADE;
DROP TABLE IF EXISTS "Budgets" CASCADE;
DROP TABLE IF EXISTS "AuditLogs" CASCADE;
DROP TABLE IF EXISTS "Permissions" CASCADE;
DROP TABLE IF EXISTS "RolePermissions" CASCADE;
DROP TABLE IF EXISTS "UserPermissions" CASCADE;
DROP TABLE IF EXISTS "EventExpenses" CASCADE;
DROP TABLE IF EXISTS "EventRevenues" CASCADE;
DROP TABLE IF EXISTS "Revenues" CASCADE;
DROP TABLE IF EXISTS "ExpenseCategories" CASCADE;

-- 3. DROPAR todas as sequences
DROP SEQUENCE IF EXISTS "Users_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Organizations_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Roles_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Events_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Campaigns_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "People_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "PersonRoles_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventPromoters_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "PromoterSales_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventGuests_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Suppliers_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "SupplierProposals_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "SupplierProposalAttachments_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventAttachments_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventSchedules_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventTeams_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "MarketingAssets_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "MarketingCampaigns_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "MarketingPosts_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Schedules_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "PostingSchedules_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Budgets_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "AuditLogs_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Permissions_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "RolePermissions_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "UserPermissions_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventExpenses_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "EventRevenues_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "Revenues_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "ExpenseCategories_Id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "UserOrganizations_Id_seq" CASCADE;

-- 4. Limpar cache do PostgreSQL
DISCARD ALL;

-- 5. Verificar se tudo foi removido
SELECT 
    'Verificação final:' as status,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name IN ('Users', 'Organizations', 'Roles', 'UserOrganizations')
        ) THEN 'SUCCESS: Todas as tabelas foram removidas'
        ELSE 'ERROR: Ainda existem tabelas'
    END as result;

-- =====================================================
-- FIM DO SCRIPT NUCLEAR
-- =====================================================

