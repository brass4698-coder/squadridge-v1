/**
 * Placeholder rows for the ledger entries table and mobile stack — used as “more entries” previews
 * on {@link LedgerPage} until live data ships.
 */
export function LedgerPageSkeletonRows({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <tr key={i} className="border-b border-[#1e2a3a]/50 align-top animate-pulse">
          <td className="px-4 py-4">
            <div className="h-3 w-20 rounded bg-[#1e2a3a]/90" />
          </td>
          <td className="px-4 py-4">
            <div className="h-3 w-28 rounded bg-[#1e2a3a]/90" />
          </td>
          <td className="px-4 py-4">
            <div className="space-y-2">
              <div className="h-3 max-w-[12rem] rounded bg-[#1e2a3a]/80" />
              <div className="h-3 max-w-[9rem] rounded bg-[#1e2a3a]/60" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="flex gap-1.5">
              <div className="h-5 w-12 rounded bg-[#1e2a3a]/70" />
              <div className="h-5 w-14 rounded bg-[#1e2a3a]/70" />
            </div>
          </td>
          <td className="px-4 py-4">
            <div className="h-4 w-24 rounded bg-[#1e2a3a]/70" />
          </td>
        </tr>
      ))}
    </>
  );
}

export function LedgerPageSkeletonCards({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="animate-pulse px-4 py-5">
          <div className="h-3 w-24 rounded bg-[#1e2a3a]/90" />
          <div className="mt-3 h-4 w-3/4 max-w-xs rounded bg-[#1e2a3a]/80" />
          <div className="mt-2 h-3 w-full max-w-md rounded bg-[#1e2a3a]/60" />
          <div className="mt-2 h-3 w-11/12 max-w-sm rounded bg-[#1e2a3a]/50" />
          <div className="mt-4 flex gap-2">
            <div className="h-5 w-14 rounded bg-[#1e2a3a]/70" />
            <div className="h-5 w-16 rounded bg-[#1e2a3a]/70" />
          </div>
          <div className="mt-4 h-4 w-28 rounded bg-[#1e2a3a]/70" />
        </div>
      ))}
    </>
  );
}
