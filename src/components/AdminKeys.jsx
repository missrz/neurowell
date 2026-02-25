import React, { useEffect, useState } from 'react';
import { listApiKeys, createApiKey, getApiKey, deleteApiKey, validateApiKey, updateApiKey } from '../services/api';

export default function AdminKeys(){
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', provider:'gemini', key:'', notes:'' });

  const load = async () => {
    setLoading(true);
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createApiKey(form);
      setForm({ name:'', provider:'gemini', key:'', notes:'' });
      await load();
    } catch (err) { console.error(err); }
  };

  const handleCopy = async (id) => {
    try {
      const full = await getApiKey(id, true);
      const key = full?.key || '';
      if (!key) return alert('No key available');
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(key);
        alert('Key copied to clipboard');
      } else {
        // Fallback for older browsers
        window.prompt('Copy the key below:', key);
      }
    } catch (e){ console.error(e); alert('Failed to copy key'); }
  };

  const handleValidate = async (id) => {
    try {
      const res = await validateApiKey(id);
      alert(JSON.stringify(res));
    } catch (e){ console.error(e); alert('Validation failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this key?')) return;
    try { await deleteApiKey(id); await load(); } catch (e){ console.error(e); }
  };

  return (
    <section className="admin-keys">
      <h2>API Keys</h2>
      <form onSubmit={handleCreate} style={{marginBottom:12}}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
        <select value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})}>
          <option value="gemini">gemini</option>
          <option value="grok">grok</option>
          <option value="other">other</option>
        </select>
        <input placeholder="API Key" value={form.key} onChange={e=>setForm({...form,key:e.target.value})} required />
        <input placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} />
        <button type="submit">Create Key</button>
      </form>

      {loading ? <div>Loading...</div> : (
        <table className="admin-table">
          <thead><tr><th>Name</th><th>Provider</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {keys.map(k => (
              <tr key={k._id}>
                <td>{k.name}</td>
                <td>{k.provider}</td>
                <td>{k.isActive ? 'Yes' : 'No'}</td>
                <td>{new Date(k.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={()=>handleCopy(k._id)}>Copy</button>
                  <button onClick={()=>handleValidate(k._id)}>Validate</button>
                  <button onClick={()=>handleDelete(k._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
