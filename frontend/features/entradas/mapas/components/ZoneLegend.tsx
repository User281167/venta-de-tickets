export function ZoneLegend() {
  return (
    <div className="!flex !flex-wrap !gap-5 !text-xs !text-white/60">
      <span className="!inline-flex !items-center !gap-1.5">
        <span
          className="!inline-block !h-2.5 !w-2.5 !rounded-full"
          style={{ background: "#22c55e" }}
        />
        Disponible
      </span>
      <span className="!inline-flex !items-center !gap-1.5 text-red-400">
        <span
          className="!inline-block !h-2.5 !w-2.5 !rounded-full"
          style={{ background: "#f87171" }}
        />
        Zona Ocupada
      </span>
      <span className="!inline-flex !items-center !gap-1.5">
        <span
          className="!inline-block !h-2.5 !w-2.5 !rounded-full"
          style={{ background: "rgba(255,255,255,0.18)" }}
        />
        Zona inactiva
      </span>
    </div>
  );
}
