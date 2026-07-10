-- Normalize legacy execution result codes to O / X / N/A / N/T with null as unset.
UPDATE "test_run_items" SET "result" = NULL WHERE "result" IN ('NT', '');
UPDATE "test_run_items" SET "result" = 'N/A' WHERE "result" = 'BLOCK';
UPDATE "test_run_items" SET "executed_at" = NULL WHERE "result" IS NULL;
