-- =====================================================
-- SCRIPT DE MIGRAÇÃO: PROMOTERS → USUÁRIOS
-- Sistema: Pulse8
-- Data: $(date)
-- Descrição: Migra promoters de Person para User
-- =====================================================

-- BACKUP RECOMENDADO: Execute antes de rodar este script
-- pg_dump -h localhost -p 5432 -U admin -d appdb > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql

BEGIN;

-- =====================================================
-- 1. CRIAR TABELA UserOrganizations
-- =====================================================

CREATE TABLE IF NOT EXISTS "UserOrganizations" (
    "Id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "UserId" UUID NOT NULL,
    "OrganizationId" UUID NOT NULL,
    "RoleId" UUID NOT NULL,
    "Status" INTEGER NOT NULL DEFAULT 0,
    "JoinedAt" TIMESTAMP WITH TIME ZONE,
    "LeftAt" TIMESTAMP WITH TIME ZONE,
    "CreatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "CreatedBy" UUID,
    "UpdatedBy" UUID,
    "IsDeleted" BOOLEAN NOT NULL DEFAULT FALSE,
    "DeletedAt" TIMESTAMP WITH TIME ZONE,
    "DeletedBy" UUID
);

-- Índices para UserOrganizations
CREATE UNIQUE INDEX IF NOT EXISTS "IX_UserOrganizations_UserId_OrganizationId" 
ON "UserOrganizations" ("UserId", "OrganizationId") 
WHERE "IsDeleted" = FALSE;

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_UserId" 
ON "UserOrganizations" ("UserId");

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_OrganizationId" 
ON "UserOrganizations" ("OrganizationId");

CREATE INDEX IF NOT EXISTS "IX_UserOrganizations_RoleId" 
ON "UserOrganizations" ("RoleId");

-- Foreign Keys para UserOrganizations
ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Users_UserId" 
FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Organizations_OrganizationId" 
FOREIGN KEY ("OrganizationId") REFERENCES "Organizations"("Id") ON DELETE CASCADE;

ALTER TABLE "UserOrganizations" 
ADD CONSTRAINT "FK_UserOrganizations_Roles_RoleId" 
FOREIGN KEY ("RoleId") REFERENCES "Roles"("Id") ON DELETE CASCADE;

-- =====================================================
-- 2. MIGRAR DADOS EXISTENTES DE Users PARA UserOrganizations
-- =====================================================

-- Migrar associações existentes de Users para UserOrganizations
INSERT INTO "UserOrganizations" (
    "UserId", 
    "OrganizationId", 
    "RoleId", 
    "Status", 
    "JoinedAt", 
    "CreatedAt", 
    "CreatedBy"
)
SELECT 
    u."Id" as "UserId",
    u."OrganizationId",
    u."RoleId",
    CASE 
        WHEN u."Status" = 0 THEN 0  -- Active
        WHEN u."Status" = 1 THEN 1  -- Inactive
        WHEN u."Status" = 2 THEN 2  -- Suspended
        ELSE 3  -- Pending
    END as "Status",
    u."CreatedAt" as "JoinedAt",
    u."CreatedAt",
    u."CreatedBy"
FROM "Users" u
WHERE u."IsDeleted" = FALSE;

-- =====================================================
-- 3. ADICIONAR COLUNA UserId TEMPORÁRIA EM EventPromoters
-- =====================================================

-- Adicionar coluna UserId temporária
ALTER TABLE "EventPromoters" 
ADD COLUMN IF NOT EXISTS "UserId" UUID;

-- Criar índice temporário para performance
CREATE INDEX IF NOT EXISTS "IX_EventPromoters_UserId_Temp" 
ON "EventPromoters" ("UserId");

-- =====================================================
-- 4. MIGRAR EventPromoters DE Person PARA User
-- =====================================================

-- Estratégia 1: Match por email (mais confiável)
UPDATE "EventPromoters" 
SET "UserId" = u."Id"
FROM "People" p
INNER JOIN "Users" u ON LOWER(TRIM(p."Email")) = LOWER(TRIM(u."Email"))
WHERE "EventPromoters"."PersonId" = p."Id"
  AND "EventPromoters"."IsDeleted" = FALSE
  AND p."IsDeleted" = FALSE
  AND u."IsDeleted" = FALSE;

-- Estratégia 2: Match por nome + email (backup)
UPDATE "EventPromoters" 
SET "UserId" = u."Id"
FROM "People" p
INNER JOIN "Users" u ON 
    LOWER(TRIM(p."FirstName")) = LOWER(TRIM(u."FirstName")) AND
    LOWER(TRIM(p."LastName")) = LOWER(TRIM(u."LastName")) AND
    LOWER(TRIM(p."Email")) = LOWER(TRIM(u."Email"))
WHERE "EventPromoters"."PersonId" = p."Id"
  AND "EventPromoters"."UserId" IS NULL
  AND "EventPromoters"."IsDeleted" = FALSE
  AND p."IsDeleted" = FALSE
  AND u."IsDeleted" = FALSE;

-- =====================================================
-- 5. VERIFICAR MIGRAÇÃO
-- =====================================================

-- Contar registros migrados
DO $$
DECLARE
    total_promoters INTEGER;
    migrated_promoters INTEGER;
    unmigrated_promoters INTEGER;
BEGIN
    -- Total de promoters
    SELECT COUNT(*) INTO total_promoters 
    FROM "EventPromoters" 
    WHERE "IsDeleted" = FALSE;
    
    -- Promoters migrados
    SELECT COUNT(*) INTO migrated_promoters 
    FROM "EventPromoters" 
    WHERE "UserId" IS NOT NULL 
      AND "IsDeleted" = FALSE;
    
    -- Promoters não migrados
    SELECT COUNT(*) INTO unmigrated_promoters 
    FROM "EventPromoters" 
    WHERE "UserId" IS NULL 
      AND "IsDeleted" = FALSE;
    
    RAISE NOTICE '=== RELATÓRIO DE MIGRAÇÃO ===';
    RAISE NOTICE 'Total de Promoters: %', total_promoters;
    RAISE NOTICE 'Promoters Migrados: %', migrated_promoters;
    RAISE NOTICE 'Promoters NÃO Migrados: %', unmigrated_promoters;
    RAISE NOTICE 'Taxa de Sucesso: %', ROUND((migrated_promoters::DECIMAL / total_promoters * 100), 2) || '%';
    
    IF unmigrated_promoters > 0 THEN
        RAISE NOTICE '⚠️  ATENÇÃO: Existem % promoters não migrados!', unmigrated_promoters;
        RAISE NOTICE 'Verifique os registros sem match:';
        
        -- Mostrar registros não migrados
        FOR rec IN 
            SELECT ep."Id", p."FirstName", p."LastName", p."Email"
            FROM "EventPromoters" ep
            INNER JOIN "People" p ON ep."PersonId" = p."Id"
            WHERE ep."UserId" IS NULL 
              AND ep."IsDeleted" = FALSE
              AND p."IsDeleted" = FALSE
            LIMIT 10
        LOOP
            RAISE NOTICE '  - ID: %, Nome: % %, Email: %', 
                rec."Id", rec."FirstName", rec."LastName", rec."Email";
        END LOOP;
    ELSE
        RAISE NOTICE '✅ Migração 100% concluída com sucesso!';
    END IF;
END $$;

-- =====================================================
-- 6. CRIAR USUÁRIOS PARA PESSOAS SEM MATCH (OPCIONAL)
-- =====================================================

-- Script para criar usuários para pessoas que não tiveram match
-- DESCOMENTE APENAS SE NECESSÁRIO

/*
DO $$
DECLARE
    person_record RECORD;
    new_user_id UUID;
    default_org_id UUID;
    default_role_id UUID;
BEGIN
    -- Obter organização e role padrão (ajuste conforme necessário)
    SELECT "Id" INTO default_org_id FROM "Organizations" WHERE "IsDeleted" = FALSE LIMIT 1;
    SELECT "Id" INTO default_role_id FROM "Roles" WHERE "IsDeleted" = FALSE LIMIT 1;
    
    IF default_org_id IS NULL OR default_role_id IS NULL THEN
        RAISE EXCEPTION 'Organização ou Role padrão não encontrados!';
    END IF;
    
    -- Criar usuários para pessoas sem match
    FOR person_record IN 
        SELECT DISTINCT p."Id", p."FirstName", p."LastName", p."Email", p."Phone", p."Document"
        FROM "People" p
        INNER JOIN "EventPromoters" ep ON p."Id" = ep."PersonId"
        WHERE ep."UserId" IS NULL 
          AND ep."IsDeleted" = FALSE
          AND p."IsDeleted" = FALSE
    LOOP
        -- Gerar novo ID
        new_user_id := gen_random_uuid();
        
        -- Inserir usuário
        INSERT INTO "Users" (
            "Id", "FirstName", "LastName", "Email", "Phone", "Document",
            "PasswordHash", "Status", "CreatedAt", "CreatedBy"
        ) VALUES (
            new_user_id,
            person_record."FirstName",
            person_record."LastName", 
            person_record."Email",
            person_record."Phone",
            person_record."Document",
            '$2a$10$dummy.hash.for.migration', -- Hash temporário
            0, -- Active
            NOW(),
            (SELECT "Id" FROM "Users" WHERE "IsDeleted" = FALSE LIMIT 1) -- Admin user
        );
        
        -- Criar associação com organização
        INSERT INTO "UserOrganizations" (
            "UserId", "OrganizationId", "RoleId", "Status", "JoinedAt", "CreatedAt", "CreatedBy"
        ) VALUES (
            new_user_id, default_org_id, default_role_id, 0, NOW(), NOW(),
            (SELECT "Id" FROM "Users" WHERE "IsDeleted" = FALSE LIMIT 1)
        );
        
        -- Atualizar EventPromoters
        UPDATE "EventPromoters" 
        SET "UserId" = new_user_id
        WHERE "PersonId" = person_record."Id" 
          AND "UserId" IS NULL;
        
        RAISE NOTICE 'Criado usuário para: % % (%)', 
            person_record."FirstName", person_record."LastName", person_record."Email";
    END LOOP;
END $$;
*/

-- =====================================================
-- 7. VALIDAÇÕES FINAIS
-- =====================================================

-- Verificar integridade dos dados
DO $$
DECLARE
    orphan_promoters INTEGER;
    invalid_users INTEGER;
BEGIN
    -- Promoters órfãos (sem usuário válido)
    SELECT COUNT(*) INTO orphan_promoters
    FROM "EventPromoters" ep
    LEFT JOIN "Users" u ON ep."UserId" = u."Id"
    WHERE ep."UserId" IS NOT NULL 
      AND (u."Id" IS NULL OR u."IsDeleted" = TRUE)
      AND ep."IsDeleted" = FALSE;
    
    -- Usuários inválidos em UserOrganizations
    SELECT COUNT(*) INTO invalid_users
    FROM "UserOrganizations" uo
    LEFT JOIN "Users" u ON uo."UserId" = u."Id"
    WHERE (u."Id" IS NULL OR u."IsDeleted" = TRUE);
    
    RAISE NOTICE '=== VALIDAÇÃO FINAL ===';
    RAISE NOTICE 'Promoters órfãos: %', orphan_promoters;
    RAISE NOTICE 'UserOrganizations inválidas: %', invalid_users;
    
    IF orphan_promoters > 0 OR invalid_users > 0 THEN
        RAISE WARNING '⚠️  Problemas de integridade detectados!';
    ELSE
        RAISE NOTICE '✅ Validação passou - dados íntegros!';
    END IF;
END $$;

-- =====================================================
-- 8. LIMPEZA E FINALIZAÇÃO
-- =====================================================

-- Remover índice temporário
DROP INDEX IF EXISTS "IX_EventPromoters_UserId_Temp";

-- Comentários para documentação
COMMENT ON TABLE "UserOrganizations" IS 'Associações de usuários com organizações - permite multi-organização';
COMMENT ON COLUMN "UserOrganizations"."Status" IS '0=Active, 1=Inactive, 2=Suspended, 3=Pending';
COMMENT ON COLUMN "UserOrganizations"."JoinedAt" IS 'Data de entrada na organização';
COMMENT ON COLUMN "UserOrganizations"."LeftAt" IS 'Data de saída da organização (se aplicável)';

-- =====================================================
-- 9. PRÓXIMOS PASSOS (MANUAL)
-- =====================================================

/*
APÓS EXECUTAR ESTE SCRIPT:

1. ✅ Verificar se todos os promoters foram migrados
2. ✅ Testar a aplicação com os novos relacionamentos
3. ✅ Remover coluna PersonId de EventPromoters (após testes)
4. ✅ Atualizar aplicação para usar UserId em vez de PersonId
5. ✅ Executar testes de integração
6. ✅ Deploy em produção

COMANDOS PARA REMOÇÃO FINAL (APÓS TESTES):
-- ALTER TABLE "EventPromoters" DROP COLUMN "PersonId";
-- ALTER TABLE "Users" DROP COLUMN "OrganizationId";
-- ALTER TABLE "Users" DROP COLUMN "RoleId";
*/

COMMIT;

-- =====================================================
-- FIM DO SCRIPT DE MIGRAÇÃO
-- =====================================================

