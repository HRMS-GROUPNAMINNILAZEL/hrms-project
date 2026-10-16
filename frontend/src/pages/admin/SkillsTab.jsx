import { useEffect, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  getEmployees,
  getSkills, createSkill, deleteSkill,
  getEmployeeSkills, createEmployeeSkill, deleteEmployeeSkill,
  getRoleRequiredSkills, createRoleRequiredSkill, deleteRoleRequiredSkill,
  getSkillGapAnalysis,
  getDepartments
} from '../../services/api';

const btn = (bg) => ({ padding: '8px 16px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' });
const smallBtn = (bg) => ({ padding: '4px 8px', backgroundColor: bg, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginRight: '6px' });
const badge = (bg, color) => ({ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', backgroundColor: bg, color, textTransform: 'capitalize' });
const subTabBtn = (active) => ({ padding: '8px 14px', marginRight: '8px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: active ? '#343a40' : '#e9ecef', color: active ? 'white' : '#333' });

const gapStatusBadge = (status) => {
  if (status === 'met') return badge('#d4edda', '#155724');
  if (status === 'below') return badge('#fff3cd', '#856404');
  return badge('#f8d7da', '#721c24'); // missing
};

export default function SkillsTab() {
  const { theme, isDarkMode } = useTheme();
  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: '0', backgroundColor: theme.cardBg, boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${theme.border}` };
  const thead = { backgroundColor: theme.tableHeaderBg, textAlign: 'left', borderBottom: `1px solid ${theme.border}` };
  const th = { padding: '16px 20px', fontSize: '12px', fontWeight: '600', color: theme.text, textTransform: 'uppercase', letterSpacing: '0.04em' };
  const td = { padding: '18px 20px', fontSize: '14px', color: theme.text, verticalAlign: 'middle' };
  const row = { borderBottom: `1px solid ${theme.border}`, transition: 'background-color 0.15s ease' };
  const emptyRow = { padding: '48px 20px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' };
  const label = { display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: theme.text };
  const input = { width: '100%', padding: '10px 14px', boxSizing: 'border-box', borderRadius: '6px', border: `1px solid ${theme.inputBorder}`, fontSize: '14px', color: theme.text, backgroundColor: theme.inputBg, outline: 'none', transition: 'border-color 0.15s ease, box-shadow 0.15s ease' };

  const [subTab, setSubTab] = useState('catalog'); // catalog | assignments | requirements | gap
  const [skills, setSkills] = useState([]);
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const [roleSkills, setRoleSkills] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [s, es, rs, emp, dept] = await Promise.all([
        getSkills(), getEmployeeSkills(), getRoleRequiredSkills(), getEmployees(), getDepartments()
      ]);
      setSkills(s); setEmployeeSkills(es); setRoleSkills(rs); setEmployees(emp); setDepartments(dept);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load skills data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  // --- Skill catalog form ---
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('technical');
  const addSkill = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createSkill({ skillName: newSkillName, category: newSkillCategory });
      setNewSkillName('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add skill');
    }
  };

  // --- Employee skill assignment form ---
  const [assignEmployeeId, setAssignEmployeeId] = useState('');
  const [assignSkillId, setAssignSkillId] = useState('');
  const [assignLevel, setAssignLevel] = useState('beginner');
  const addAssignment = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createEmployeeSkill({
        employee: { employeeId: Number(assignEmployeeId) },
        skill: { skillId: Number(assignSkillId) },
        proficiencyLevel: assignLevel,
        acquiredDate: new Date().toISOString().split('T')[0]
      });
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to assign skill');
    }
  };

  // --- Role requirement form ---
  const [reqPosition, setReqPosition] = useState('');
  const [reqDeptId, setReqDeptId] = useState('');
  const [reqSkillId, setReqSkillId] = useState('');
  const [reqLevel, setReqLevel] = useState('intermediate');
  const addRequirement = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createRoleRequiredSkill({
        position: reqPosition,
        department: reqDeptId ? { departmentId: Number(reqDeptId) } : null,
        skill: { skillId: Number(reqSkillId) },
        requiredLevel: reqLevel
      });
      setReqPosition('');
      loadAll();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add role requirement');
    }
  };

  // --- Gap analysis ---
  const [gapEmployeeId, setGapEmployeeId] = useState('');
  const [gapResult, setGapResult] = useState(null);
  const [gapLoading, setGapLoading] = useState(false);
  const runGapAnalysis = async () => {
    if (!gapEmployeeId) return;
    setGapLoading(true);
    setError('');
    try {
      const result = await getSkillGapAnalysis(gapEmployeeId);
      setGapResult(result);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to run gap analysis');
    } finally {
      setGapLoading(false);
    }
  };

  return (
    <div>
      <p style={{ color: '#6c757d', fontSize: '14px', marginBottom: '16px' }}>
        Maintain the skill catalog, record what each employee actually knows, define what each role requires,
        and compare the two to spot training gaps.
      </p>

      <div style={{ marginBottom: '20px' }}>
        <button style={subTabBtn(subTab === 'catalog')} onClick={() => setSubTab('catalog')}>Skill Catalog</button>
        <button style={subTabBtn(subTab === 'assignments')} onClick={() => setSubTab('assignments')}>Employee Skills</button>
        <button style={subTabBtn(subTab === 'requirements')} onClick={() => setSubTab('requirements')}>Role Requirements</button>
        <button style={subTabBtn(subTab === 'gap')} onClick={() => setSubTab('gap')}>Gap Analysis</button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: '15px', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px' }}>{error}</div>}
      {loading && <div style={emptyRow}>Loading...</div>}

      {!loading && subTab === 'catalog' && (
        <div>
          <form onSubmit={addSkill} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={label}>New Skill Name</label>
              <input style={input} value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} required />
            </div>
            <div style={{ width: '180px' }}>
              <label style={label}>Category</label>
              <select style={input} value={newSkillCategory} onChange={(e) => setNewSkillCategory(e.target.value)}>
                <option value="technical">Technical</option>
                <option value="soft">Soft Skill</option>
                <option value="certification">Certification</option>
              </select>
            </div>
            <button type="submit" style={btn('#28a745')}>+ Add Skill</button>
          </form>

          <table style={table}>
            <thead style={thead}><tr><th style={th}>Skill</th><th style={th}>Category</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {skills.length === 0 && <tr><td style={emptyRow} colSpan={3}>No skills defined yet.</td></tr>}
              {skills.map(s => (
                <tr key={s.skillId} style={row}>
                  <td style={td}>{s.skillName}</td>
                  <td style={td}><span style={badge('#e2e3e5', '#383d41')}>{s.category}</span></td>
                  <td style={td}>
                    <button style={smallBtn('#dc3545')} onClick={async () => { if (window.confirm('Delete this skill?')) { await deleteSkill(s.skillId); loadAll(); } }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && subTab === 'assignments' && (
        <div>
          <form onSubmit={addAssignment} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '220px' }}>
              <label style={label}>Employee</label>
              <select style={input} value={assignEmployeeId} onChange={(e) => setAssignEmployeeId(e.target.value)} required>
                <option value="">Select...</option>
                {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </div>
            <div style={{ minWidth: '200px' }}>
              <label style={label}>Skill</label>
              <select style={input} value={assignSkillId} onChange={(e) => setAssignSkillId(e.target.value)} required>
                <option value="">Select...</option>
                {skills.map(s => <option key={s.skillId} value={s.skillId}>{s.skillName}</option>)}
              </select>
            </div>
            <div style={{ width: '160px' }}>
              <label style={label}>Proficiency</label>
              <select style={input} value={assignLevel} onChange={(e) => setAssignLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <button type="submit" style={btn('#28a745')}>+ Assign</button>
          </form>

          <table style={table}>
            <thead style={thead}><tr><th style={th}>Employee</th><th style={th}>Skill</th><th style={th}>Proficiency</th><th style={th}>Acquired</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {employeeSkills.length === 0 && <tr><td style={emptyRow} colSpan={5}>No skills assigned yet.</td></tr>}
              {employeeSkills.map(es => (
                <tr key={es.employeeSkillId} style={row}>
                  <td style={td}>{es.employee ? `${es.employee.firstName} ${es.employee.lastName}` : (es.employeeName || '—')}</td>
                  <td style={td}>{es.skill?.skillName || es.skillName || '—'}</td>
                  <td style={td}><span style={badge('#cce5ff', '#004085')}>{es.proficiencyLevel}</span></td>
                  <td style={td}>{es.acquiredDate}</td>
                  <td style={td}>
                    <button style={smallBtn('#dc3545')} onClick={async () => { if (window.confirm('Remove this skill record?')) { await deleteEmployeeSkill(es.employeeSkillId); loadAll(); } }}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && subTab === 'requirements' && (
        <div>
          <form onSubmit={addRequirement} style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ minWidth: '180px' }}>
              <label style={label}>Position</label>
              <input style={input} placeholder="e.g. Software Engineer" value={reqPosition} onChange={(e) => setReqPosition(e.target.value)} required />
            </div>
            <div style={{ minWidth: '180px' }}>
              <label style={label}>Department (optional)</label>
              <select style={input} value={reqDeptId} onChange={(e) => setReqDeptId(e.target.value)}>
                <option value="">Any department</option>
                {departments.map(d => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
              </select>
            </div>
            <div style={{ minWidth: '200px' }}>
              <label style={label}>Skill</label>
              <select style={input} value={reqSkillId} onChange={(e) => setReqSkillId(e.target.value)} required>
                <option value="">Select...</option>
                {skills.map(s => <option key={s.skillId} value={s.skillId}>{s.skillName}</option>)}
              </select>
            </div>
            <div style={{ width: '160px' }}>
              <label style={label}>Required Level</label>
              <select style={input} value={reqLevel} onChange={(e) => setReqLevel(e.target.value)}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <button type="submit" style={btn('#28a745')}>+ Add Requirement</button>
          </form>

          <table style={table}>
            <thead style={thead}><tr><th style={th}>Position</th><th style={th}>Department</th><th style={th}>Skill</th><th style={th}>Required Level</th><th style={th}>Actions</th></tr></thead>
            <tbody>
              {roleSkills.length === 0 && <tr><td style={emptyRow} colSpan={5}>No role requirements defined yet.</td></tr>}
              {roleSkills.map(rs => (
                <tr key={rs.id} style={row}>
                  <td style={td}>{rs.position}</td>
                  <td style={td}>{rs.department?.departmentName || rs.departmentName || 'Any'}</td>
                  <td style={td}>{rs.skill?.skillName || rs.skillName || '—'}</td>
                  <td style={td}><span style={badge('#e2e3e5', '#383d41')}>{rs.requiredLevel}</span></td>
                  <td style={td}>
                    <button style={smallBtn('#dc3545')} onClick={async () => { if (window.confirm('Delete this requirement?')) { await deleteRoleRequiredSkill(rs.id); loadAll(); } }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && subTab === 'gap' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'flex-end' }}>
            <div style={{ minWidth: '260px' }}>
              <label style={label}>Employee</label>
              <select style={input} value={gapEmployeeId} onChange={(e) => setGapEmployeeId(e.target.value)}>
                <option value="">Select an employee...</option>
                {employees.map(emp => <option key={emp.employeeId} value={emp.employeeId}>{emp.firstName} {emp.lastName} — {emp.position || 'No position set'}</option>)}
              </select>
            </div>
            <button style={btn('#007bff')} onClick={runGapAnalysis} disabled={!gapEmployeeId || gapLoading}>
              {gapLoading ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>

          {gapResult && (
            gapResult.length === 0 ? (
              <div style={emptyRow}>No skill requirements are defined for this employee's position, so there's nothing to compare against yet.</div>
            ) : (
              <table style={table}>
                <thead style={thead}><tr><th style={th}>Skill</th><th style={th}>Required Level</th><th style={th}>Current Level</th><th style={th}>Status</th></tr></thead>
                <tbody>
                  {gapResult.map((g, idx) => (
                    <tr key={idx} style={row}>
                      <td style={td}>{g.skill?.skillName || g.skillName || '—'}</td>
                      <td style={{ ...td, textTransform: 'capitalize' }}>{g.requiredLevel}</td>
                      <td style={{ ...td, textTransform: 'capitalize' }}>{g.currentLevel || '— not on file —'}</td>
                      <td style={td}><span style={gapStatusBadge(g.status)}>{g.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </div>
  );
}
