-- =====================================================
-- Script AGESSIVO para forçar reset do Entity Framework
-- Remove TODAS as referências às colunas OrganizationId e RoleId
-- =====================================================

-- 1. PARAR todas as conexões ativas (cuidado!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

-- 2. Verificar se as colunas ainda existem
DO $$
DECLARE
    org_exists boolean;
    role_exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'OrganizationId'
    ) INTO org_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'RoleId'
    ) INTO role_exists;
    
    IF org_exists THEN
        RAISE NOTICE 'Coluna OrganizationId ainda existe - removendo...';
        ALTER TABLE "Users" DROP COLUMN IF EXISTS "OrganizationId";
    END IF;
    
    IF role_exists THEN
        RAISE NOTICE 'Coluna RoleId ainda existe - removendo...';
        ALTER TABLE "Users" DROP COLUMN IF EXISTS "RoleId";
    END IF;
    
    IF NOT org_exists AND NOT role_exists THEN
        RAISE NOTICE 'Colunas OrganizationId e RoleId já foram removidas';
    END IF;
END $$;

-- 3. Remover TODAS as foreign keys relacionadas
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Organizations_OrganizationId";
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Roles_RoleId";
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Organization_OrganizationId";
ALTER TABLE "Users" DROP CONSTRAINT IF EXISTS "FK_Users_Role_RoleId";

-- 4. Remover TODOS os índices relacionados
DROP INDEX IF EXISTS "IX_Users_OrganizationId";
DROP INDEX IF EXISTS "IX_Users_RoleId";
DROP INDEX IF EXISTS "IX_Users_Organization_OrganizationId";
DROP INDEX IF EXISTS "IX_Users_Role_RoleId";

-- 5. Verificar se a tabela UserOrganizations existe e tem dados
SELECT 
    'UserOrganizations status:' as info,
    COUNT(*) as record_count
FROM "UserOrganizations";

-- 6. Se não houver dados em UserOrganizations, criar um registro padrão
DO $$
DECLARE
    user_count integer;
    org_count integer;
    role_count integer;
BEGIN
    SELECT COUNT(*) INTO user_count FROM "Users";
    SELECT COUNT(*) INTO org_count FROM "Organizations";
    SELECT COUNT(*) INTO role_count FROM "Roles";
    
    IF user_count > 0 AND org_count > 0 AND role_count > 0 THEN
        -- Criar associação padrão para usuários existentes
        INSERT INTO "UserOrganizations" ("UserId", "OrganizationId", "RoleId", "Status", "JoinedAt", "CreatedAt")
        SELECT 
            u."Id",
            (SELECT "Id" FROM "Organizations" LIMIT 1),
            (SELECT "Id" FROM "Roles" LIMIT 1),
            0, -- Active
            u."CreatedAt",
            u."CreatedAt"
        FROM "Users" u
        WHERE NOT EXISTS (
            SELECT 1 FROM "UserOrganizations" uo 
            WHERE uo."UserId" = u."Id"
        );
        
        RAISE NOTICE 'Associações padrão criadas para usuários existentes';
    END IF;
END $$;

-- 7. Limpar cache do PostgreSQL completamente
DISCARD ALL;

-- 8. Verificar estrutura final
SELECT 
    'Final verification:' as status,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Users' AND column_name = 'OrganizationId'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Users' AND column_name = 'RoleId'
        ) THEN 'SUCCESS: Colunas removidas'
        ELSE 'ERROR: Colunas ainda existem'
    END as result;

-- 9. Mostrar estrutura da tabela Users
SELECT 
    'Users table structure:' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;

-- 10. Mostrar dados da tabela UserOrganizations
SELECT 
    'UserOrganizations data:' as info;
    
SELECT 
    COUNT(*) as total_associations,
    COUNT(DISTINCT "UserId") as unique_users,
    COUNT(DISTINCT "OrganizationId") as unique_organizations
FROM "UserOrganizations";

-- =====================================================
-- FIM DO SCRIPT AGESSIVO
-- =====================================================

