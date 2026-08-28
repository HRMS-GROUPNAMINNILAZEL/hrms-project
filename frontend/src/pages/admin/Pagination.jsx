import { useTheme } from '../../context/ThemeContext';

// Reusable pager for client-side paginated tables. Shows Prev/Next plus the
// current range, and hides itself entirely when there's nothing to page through.
export default function Pagination({ page, totalItems, pageSize, onPageChange }) {
  const { theme } = useTheme();
  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);

  if (totalItems === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  const pageBtn = (disabled) => ({
    padding: '6px 14px',
    borderRadius: '6px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.cardBg,
    color: disabled ? theme.textMuted : theme.text,
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    opacity: disabled ? 0.6 : 1
  });

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', flexWrap: 'wrap', gap: '10px' }}>
      <div style={{ fontSize: '13px', color: theme.textMuted }}>
        Showing {start}–{end} of {totalItems}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} style={pageBtn(page <= 1)}>
          ← Prev
        </button>
        <span style={{ fontSize: '13px', color: theme.text }}>
          Page {page} of {totalPages}
        </span>
        <button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} style={pageBtn(page >= totalPages)}>
          Next →
        </button>
      </div>
    </div>
  );
}
