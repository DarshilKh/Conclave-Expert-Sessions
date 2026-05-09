export default function Pagination({ pagination, onChange }) {
  const { page, pages, total } = pagination;

  if (pages <= 1) return null;

  const getPages = () => {
    const arr = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      arr.push(i);
    }
    if (arr[0] > 1) {
      arr.unshift('…');
      arr.unshift(1);
    }
    if (arr[arr.length - 1] < pages) {
      arr.push('…');
      arr.push(pages);
    }
    return arr;
  };

  return (
    <div className="flex items-center justify-between py-2">
      <p className="text-sm text-[#6B7280]">
        Page <span className="font-medium text-[#1a2332]">{page}</span> of{' '}
        <span className="font-medium text-[#1a2332]">{pages}</span> · {total} experts
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="px-3 py-1.5 text-sm rounded-md border border-[#D0CCC7] disabled:opacity-40
            hover:bg-[#F8F7F5] transition-colors disabled:cursor-not-allowed"
        >
          ←
        </button>

        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-[#9CA3AF]">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p)}
              className={`w-8 h-8 text-sm rounded-md border transition-colors ${
                p === page
                  ? 'bg-[#003049] text-white border-[#003049]'
                  : 'border-[#D0CCC7] hover:bg-[#F8F7F5]'
              }`}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= pages}
          className="px-3 py-1.5 text-sm rounded-md border border-[#D0CCC7] disabled:opacity-40
            hover:bg-[#F8F7F5] transition-colors disabled:cursor-not-allowed"
        >
          →
        </button>
      </div>
    </div>
  );
}
