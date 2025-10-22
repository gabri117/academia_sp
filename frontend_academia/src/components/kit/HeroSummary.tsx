import { cls } from '@/components/ui/stylekit'

type SortOpt = { label: string; value: string }

export default function HeroSummary({
  title,
  total,
  filtersLabel,
  filtersAccent,   // 'white' | 'yellow' | 'orange'
  sort,
  options,
  onChangeSort,
}: {
  title: string
  total: number | string
  filtersLabel: string
  filtersAccent?: 'white' | 'yellow' | 'orange'
  sort?: string
  options?: SortOpt[]
  onChangeSort?: (v: string) => void
}) {
  const accentClass =
    filtersAccent === 'orange' ? 'text-[#ff7a00]'
    : filtersAccent === 'yellow' ? 'text-[#ffd600]'
    : 'text-white'

  return (
    <div className={`${cls.heroCard} mb-6`}>
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-30 bg-[radial-gradient(circle_at_top_left,#ffd600,transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-20 bg-[radial-gradient(circle_at_bottom_right,#ff7a00,transparent_60%)]" />
      <div className="relative flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Panel de control</span>
          <span className="text-3xl font-semibold leading-tight">{title}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-inner backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wide text-white/70">Registros totales</span>
            <p className="mt-1 text-2xl font-semibold text-white">{total}</p>
          </div>
          <div className="rounded-2xl border border-white/25 bg-white/10 px-4 py-3 shadow-inner backdrop-blur-sm">
            <span className="text-xs uppercase tracking-wide text-white/70">Filtros</span>
            <p className={`mt-1 text-sm font-semibold ${accentClass}`}>{filtersLabel}</p>
          </div>

          {sort && options && onChangeSort && (
            <div className="rounded-2xl border border-white/30 bg-[rgba(229,242,255,0.35)] px-4 py-3 shadow-[0_18px_34px_-28px_rgba(255,255,255,0.9)] backdrop-blur-md">
              <span className="text-xs font-semibold uppercase tracking-wide text-white/80">ORDENAR</span>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {options.map(o => {
                  const selected = o.value === sort
                  return (
                    <button
                      key={o.value}
                      className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                        selected
                          ? 'border-white bg-white text-[#1f3c63] shadow-[0_10px_22px_-18px_rgba(0,102,204,0.65)]'
                          : 'border-white/60 text-white/80 hover:border-white hover:text-white'
                      }`}
                      onClick={() => onChangeSort(o.value)}
                    >
                      {o.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
