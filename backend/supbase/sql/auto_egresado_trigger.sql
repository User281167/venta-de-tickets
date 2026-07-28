create or replace function sync_user_egresado()
returns trigger
language plpgsql
as $$
begin
  -- Si la cédula es null, nunca es egresado
  if NEW.cedula is null then
    NEW.egresado := false;
  else
    NEW.egresado := exists (
      select 1
      from egresados_list e
      where e.cedula = NEW.cedula
    );
  end if;

  return NEW;
end;
$$;

create trigger trg_sync_user_egresado
before insert or update of cedula
on users
for each row
execute function sync_user_egresado();
