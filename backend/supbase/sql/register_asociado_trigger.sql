CREATE OR REPLACE FUNCTION sync_register_asociado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.is_asociado := COALESCE(
    (
      SELECT MAX(a.fecha_de_finalizacion) >= CURRENT_DATE
      FROM asociados_list a
      WHERE a.cedula = NEW.cedula
    ),
    FALSE
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_register_asociado ON register;

CREATE TRIGGER trg_sync_register_asociado
BEFORE INSERT OR UPDATE OF cedula
ON register
FOR EACH ROW
EXECUTE FUNCTION sync_register_asociado();
