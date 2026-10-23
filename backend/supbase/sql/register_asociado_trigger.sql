create or replace function sync_register_asociado()
returns trigger
language plpgsql
as $$
begin
  NEW.is_asociado := exists (
    select 1
    from asociados_list a
    where a.cedula = NEW.cedula
      and a.fecha_de_finalizacion >= current_date
  );

  return NEW;
end;
$$;

drop trigger if exists trg_sync_register_asociado on register;
create trigger trg_sync_register_asociado
before insert or update of cedula
on register
for each row
execute function sync_register_asociado();
