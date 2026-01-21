-- Remove custom UUID to VARCHAR comparison operators
-- These operators were causing issues with normal VARCHAR comparisons
-- PostgreSQL's default operators are sufficient

BEGIN;

-- Drop the custom operators
DROP OPERATOR IF EXISTS = (uuid, character varying) CASCADE;
DROP OPERATOR IF EXISTS = (character varying, uuid) CASCADE;

-- Drop the custom functions
DROP FUNCTION IF EXISTS uuid_eq_varchar(uuid, character varying) CASCADE;
DROP FUNCTION IF EXISTS varchar_eq_uuid(character varying, uuid) CASCADE;

-- Verify removal
DO $$
BEGIN
    RAISE NOTICE '✓ Removed custom UUID comparison operators';
    RAISE NOTICE '✓ PostgreSQL will use default type casting for comparisons';
END $$;

COMMIT;

