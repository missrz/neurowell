import React, { useState } from "react";
import { uploadFiles } from "../api";

export default function Upload() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(null);

  const onFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return;
    setStatus("Uploading & indexing...");
    try {
      const res = await uploadFiles(files);
      setResult(res);
      setStatus(`Indexed ${res.inserted_chunks} chunks.`);
    } catch (err) {
      console.error(err);
      setStatus("Upload/index failed. See console.");
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 720 }}>
      <h3>Upload CSV / PDF files</h3>
      <form onSubmit={onSubmit}>
        <input type="file" multiple accept=".csv,.pdf" onChange={onFileChange} />
        <div style={{ marginTop: 8 }}>
          <button type="submit">Upload & Index</button>
        </div>
      </form>

      <div style={{ marginTop: 12 }}>
        <strong>Status:</strong> {status}
      </div>

      {result && (
        <div style={{ marginTop: 12 }}>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
