-- Migración: Permitir NULL en venta_id de tickets_cocina para retiros de vianda
-- Ejecutar: psql -U postgres -d rotiseria_db -f database/migracion_tickets_cocina.sql

-- Eliminar la restricción NOT NULL de venta_id
ALTER TABLE tickets_cocina 
ALTER COLUMN venta_id DROP NOT NULL;

-- Comentario para documentar el cambio
COMMENT ON COLUMN tickets_cocina.venta_id IS 'ID de la venta asociada. NULL para retiros de vianda que no generan venta.';

