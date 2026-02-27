import React, { useEffect, useState } from 'react';
import { listAssesments, getAssesment, deleteAssesment } from '../services/api';
import '../styles/Admin.css';

export default function AdminAssessments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); // full assesment with questions
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await listAssesments();
      // handle possible wrapped responses: { assesments: [...] } or { data: [...] }
      if (Array.isArray(data)) setItems(data);
      else if (Array.isArray(data.assesments)) setItems(data.assesments);
      else if (Array.isArray(data.assessments)) setItems(data.assessments);
      else if (Array.isArray(data.data)) setItems(data.data);
      else setItems([]);
    } catch (err) {
      console.error('Error fetching assesments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleView = async (id, item) => {
    // Toggle: if already selected, collapse
    if (selected && (selected._id === id || selected._id === undefined && item && item._id === id)) {
      setSelected(null);
      return;
    }

    // show the list item immediately while fetching details
    const preview = item || { title: 'Loading...', questions: [] };
    setSelected(preview);
    setLoadingDetails(true);
    try {
      const a = await getAssesment(id);
      setSelected(prev => ({ ...(prev || {}), ...(a || {}) }));
    } catch (err) {
      console.error('Error loading assesment', err);
      setSelected(prev => ({ ...(prev || {}), _error: true }));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assessment? This cannot be undone.')) return;
    try {
      await deleteAssesment(id);
      await fetchList();
      alert('Assessment deleted');
    } catch (err) {
      console.error('Delete failed', err);
      alert('Failed to delete');
    }
  };

  return (
    <div>
      <h2>Assessments</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Created</th>
              <th>Questions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr><td colSpan="5" className="no-data">No Assessments Found</td></tr>
            ) : (
              items.map((it, idx) => (
                <React.Fragment key={it._id || idx}>
                  <tr>
                    <td>{idx + 1}</td>
                    <td>{it.title}</td>
                    <td>{it.createdAt ? it.createdAt.slice(0,10) : ''}</td>
                    <td>{Array.isArray(it.questions) ? it.questions.length : '-'}</td>
                    <td>
                      <button className="btn" onClick={() => handleView(it._id, it)}>{selected && selected._id === it._id ? 'Hide' : 'View'}</button>
                      <button className="btn danger" onClick={() => handleDelete(it._id)} style={{marginLeft:8}}>Delete</button>
                    </td>
                  </tr>
                  {selected && (selected._id === it._id || (it._id && selected._id === undefined && selected.title === it.title)) && (
                    <tr className="assesment-details">
                      <td colSpan="5" style={{background:'#fbfbff'}}>
                        {loadingDetails && <div>Loading questions...</div>}
                        {selected && selected._error && <div style={{color:'red'}}>Failed to load details.</div>}
                        {selected && selected.questions && selected.questions.length > 0 ? (
                          <div style={{padding:12}}>
                            <h4>Questions</h4>
                            <ol>
                              {selected.questions.map((q, i) => (
                                <li key={q._id || i} style={{marginBottom:8}}>
                                  <div><strong>{q.title}</strong></div>
                                  {q.options && (
                                    <ul>
                                      {q.options.map((opt, oi) => (
                                        <li key={oi}>{opt}</li>
                                      ))}
                                    </ul>
                                  )}
                                  {typeof q.correctAnswer !== 'undefined' && (
                                    <div style={{marginTop:6, color:'#0b7'}}><strong>Correct answer:</strong> {String(q.correctAnswer)}</div>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        ) : (!loadingDetails && <div style={{padding:12}}>No questions available</div>)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
