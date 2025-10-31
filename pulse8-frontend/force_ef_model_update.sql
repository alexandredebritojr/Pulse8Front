-- =====================================================
-- Script para forçar atualização do modelo Entity Framework
-- Remove completamente as referências às colunas OrganizationId e RoleId
-- =====================================================

-- 1. Verificar se as colunas ainda existem (devem retornar 0 linhas)
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'Users' 
  AND column_name IN ('OrganizationId', 'RoleId');

-- 2. Se as colunas ainda existirem, removê-las (caso o script anterior não tenha funcionado)
DO $$
BEGIN
    -- Verificar se a coluna OrganizationId existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'OrganizationId'
    ) THEN
        ALTER TABLE "Users" DROP COLUMN IF EXISTS "OrganizationId";
        RAISE NOTICE 'Coluna OrganizationId removida da tabela Users';
    END IF;
    
    -- Verificar se a coluna RoleId existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Users' AND column_name = 'RoleId'
    ) THEN
        ALTER TABLE "Users" DROP COLUMN IF EXISTS "RoleId";
        RAISE NOTICE 'Coluna RoleId removida da tabela Users';
    END IF;
END $$;

-- 3. Verificar se a tabela UserOrganizations existe e tem dados
SELECT 
    'UserOrganizations table exists' as status,
    COUNT(*) as record_count
FROM "UserOrganizations";

-- 4. Verificar estrutura da tabela Users (não deve ter OrganizationId nem RoleId)
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;

-- 5. Verificar se há foreign keys órfãs
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'Users'
    AND (kcu.column_name = 'OrganizationId' OR kcu.column_name = 'RoleId');

-- 6. Limpar cache do PostgreSQL (força recompilação de queries)
DISCARD PLANS;

-- 7. Verificar se há índices órfãos
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'Users' 
  AND (indexdef LIKE '%OrganizationId%' OR indexdef LIKE '%RoleId%');

-- 8. Remover índices órfãos se existirem
DROP INDEX IF EXISTS "IX_Users_OrganizationId";
DROP INDEX IF EXISTS "IX_Users_RoleId";

-- 9. Verificar se a migração foi bem-sucedida
SELECT 
    'Migration verification' as status,
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Users' AND column_name = 'OrganizationId'
        ) AND NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'Users' AND column_name = 'RoleId'
        ) THEN 'SUCCESS: OrganizationId and RoleId columns removed'
        ELSE 'ERROR: Columns still exist'
    END as result;

-- 10. Mostrar estrutura final da tabela Users
SELECT 
    'Final Users table structure:' as info;
    
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'Users' 
ORDER BY ordinal_position;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

