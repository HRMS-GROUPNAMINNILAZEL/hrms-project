import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  getEmployees,
  getPerformanceReviews,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview
} from '../../services/api';

const btn = (bg) => ({ padding: '8px 16px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' });
const smallBtn = (bg) => ({ padding: '4px 8px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' });

function ratingColor(rating) {
  if (rating === null || rating === undefined) return '#6c757d';
  const r = Number(rating);
  if (r >= 4) return '#28a745';
  if (r >= 3) return '#fd7e14';
  return '#dc3545';
}

const emptyForm = { employeeId: '', reviewerId: '', reviewPeriod: '', rating: '', comments: '' };

export default function PerformanceReviewsTab() {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };
  const label = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text };
  const input = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' };
  const modalOverlay = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
  const modalBox = { backgroundColor: theme.cardBg, padding: '32px', borderRadius: '12px', width: '460px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', color: theme.text, border: `1px solid ${theme.border}` };

  const [employees, setEmployees] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [empData, reviewData] = await Promise.all([getEmployees(), getPerformanceReviews()]);
      setEmployees(empData);
      setReviews(reviewData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load performance reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setFormData(emptyForm); setShowModal(true); };
  const openEdit = (r) => {
    setEditing(r);
    setFormData({
      employeeId: r.employee?.employeeId || '',
      reviewerId: r.reviewer?.employeeId || '',
      reviewPeriod: r.reviewPeriod || '',
      rating: r.rating ?? '',
      comments: r.comments || ''
    });
    setShowModal(true);
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      employee: { employeeId: Number(formData.employeeId) },
      reviewer: { employeeId: Number(formData.reviewerId) },
      reviewPeriod: formData.reviewPeriod,
      rating: formData.rating === '' ? null : Number(formData.rating),
      comments: formData.comments
    };
    try {
      if (editing) {
        await updatePerformanceReview(editing.reviewId, payload);
      } else {
        await createPerformanceReview(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save the review');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r) => {
    if (!window.confirm('Delete this performance review?')) return;
    try {
      await deletePerformanceReview(r.reviewId);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete review');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button onClick={openAdd} style={{ ...btn('#28a745'), fontWeight: 'bold' }}>+ Add Review</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}

      <table style={table}>
        <thead style={thead}>
          <tr>
            <th style={th}>Employee</th>
            <th style={th}>Reviewer</th>
            <th style={th}>Period</th>
            <th style={th}>Rating</th>
            <th style={th}>Comments</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td style={emptyRow} colSpan={6}>Loading...</td></tr>}
          {!loading && reviews.length === 0 && <tr><td style={emptyRow} colSpan={6}>No performance reviews yet.</td></tr>}
          {!loading && reviews.map(r => (
            <tr key={r.reviewId} style={row}>
              <td style={td}>{r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : '—'}</td>
              <td style={td}>{r.reviewer ? `${r.reviewer.firstName} ${r.reviewer.lastName}` : '—'}</td>
              <td style={td}>{r.reviewPeriod}</td>
              <td style={{ ...td, color: ratingColor(r.rating), fontWeight: 'bold' }}>{r.rating ?? '—'} / 5</td>
              <td style={{ ...td, maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.comments}>{r.comments}</td>
              <td style={td}>
                <button style={smallBtn('#007bff')} onClick={() => openEdit(r)}>Edit</button>
                <button style={smallBtn('#dc3545')} onClick={() => handleDelete(r)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3 style={{ marginTop: 0 }}>{editing ? 'Edit Review' : 'Add Performance Review'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>Employee</label>
                <select name="employeeId" style={input} value={formData.employeeId} onChange={handleChange} required>
                  <option value="">Select employee...</option>
                  {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>Reviewer</label>
                <select name="reviewerId" style={input} value={formData.reviewerId} onChange={handleChange} required>
                  <option value="">Select reviewer...</option>
                  {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>Review Period</label>
                <input name="reviewPeriod" style={input} placeholder="e.g. Q3 2026" value={formData.reviewPeriod} onChange={handleChange} required />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={label}>Rating (0.0 - 5.0)</label>
                <input name="rating" type="number" step="0.1" min="0" max="5" style={input} value={formData.rating} onChange={handleChange} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={label}>Comments</label>
                <textarea name="comments" style={{ ...input, minHeight: '90px' }} value={formData.comments} onChange={handleChange} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={btn('#6c757d')}>Cancel</button>
                <button type="submit" disabled={saving} style={btn('#007bff')}>{saving ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
