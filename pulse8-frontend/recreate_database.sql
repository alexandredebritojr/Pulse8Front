-- =====================================================
-- Script para RECRIAR o banco de dados completamente
-- Remove o banco atual e cria um novo limpo
-- =====================================================

-- 1. PARAR todas as conexões ativas
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
  AND pid <> pg_backend_pid();

-- 2. Fazer backup dos dados importantes (se houver)
-- CREATE TABLE backup_users AS SELECT * FROM "Users";
-- CREATE TABLE backup_organizations AS SELECT * FROM "Organizations";
-- CREATE TABLE backup_roles AS SELECT * FROM "Roles";

-- 3. DROPAR o banco atual (CUIDADO!)
-- DROP DATABASE IF EXISTS pulse8_db;

-- 4. CRIAR um novo banco limpo
-- CREATE DATABASE pulse8_db;

-- 5. Conectar ao novo banco
-- \c pulse8_db;

-- =====================================================
-- ALTERNATIVA MAIS SEGURA: Limpar apenas as tabelas
-- =====================================================

-- Limpar dados das tabelas (mantém estrutura)
TRUNCATE TABLE "UserOrganizations" CASCADE;
TRUNCATE TABLE "EventPromoters" CASCADE;
TRUNCATE TABLE "Users" CASCADE;
TRUNCATE TABLE "Organizations" CASCADE;
TRUNCATE TABLE "Roles" CASCADE;

-- Resetar sequences
ALTER SEQUENCE IF EXISTS "Users_Id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Organizations_Id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "Roles_Id_seq" RESTART WITH 1;
ALTER SEQUENCE IF EXISTS "UserOrganizations_Id_seq" RESTART WITH 1;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

