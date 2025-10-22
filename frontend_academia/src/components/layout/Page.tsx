import type { ReactNode } from 'react'

type PageProps = {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  children: ReactNode
}

const Page = ({ title, description, actions, children }: PageProps) => (
  <div className="flex h-full flex-col gap-6">
    {/* Header */}
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e6eefc] bg-[linear-gradient(180deg,#FFFFFF,#F9FAFB)] px-6 py-5 shadow-[0_8px_40px_rgba(0,102,204,0.12)] border-l-4 border-l-[#0066CC]">
      <div className="min-w-0">
        <h1 className="truncate text-2xl font-bold tracking-tight text-[#2E2E2E]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 truncate text-[15px] text-[#666666] leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </div>

    {/* Body */}
    <div className="flex-1 rounded-2xl border border-[#e8edf5] bg-white p-6 shadow-[0_8px_40px_rgba(0,102,204,0.08)]">
      {children}
    </div>
  </div>
)

export default Page