create or replace function sync_register_egresado()
returns trigger
language plpgsql
as $$
begin
  -- Si la cédula es null, nunca es egresado
  if NEW.cedula is null then
    NEW.is_egresado := false;
  else
    NEW.is_egresado := exists (
      select 1
      from egresados_list e
      where e.cedula = NEW.cedula
    );
  end if;

  return NEW;
end;
$$;

drop trigger if exists trg_sync_register_egresado on register;
create trigger trg_sync_register_egresado
before insert or update of cedula
on register
for each row
execute function sync_register_egresado();
