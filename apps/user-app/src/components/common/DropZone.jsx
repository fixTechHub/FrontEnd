import React, { useRef, useState } from 'react';

/**
 * Reusable drag-and-drop upload zone (single or multiple).
 * Props:
 *  - label (string)
 *  - onChange (file | FileList) => void
 *  - accept (string) – input accept attr
 *  - multiple (bool)
 *  - preview (bool) – show thumbnail for single image
 */
const DropZone = ({ label, onChange, accept = 'image/*', multiple = false, preview = true }) => {
  const inputRef = useRef();
  const [files, setFiles] = useState([]);

  const handleFiles = (fileList) => {
    const arr = multiple ? Array.from(fileList) : [fileList[0]];
    setFiles(arr);
    onChange(multiple ? fileList : fileList[0]);
  };

  const prevent = (e) => e.preventDefault();

  return (
    <div>
      {label && <label className="form-label fw-semibold">{label}</label>}
      <div
        className="upload-zone border border-2 border-dashed rounded text-center py-4 position-relative"
        onClick={() => inputRef.current?.click()}
        onDragOver={prevent}
        onDragEnter={prevent}
        onDrop={(e) => {
          prevent(e);
          handleFiles(e.dataTransfer.files);
        }}
        style={{ cursor: 'pointer' }}
      >
        {files.length === 0 && (
          <>
            <i className="bi bi-cloud-upload fs-1 text-secondary" />
            <div className="small text-muted">Kéo thả hoặc click để chọn file</div>
          </>
        )}

        {preview && files.length > 0 && (
          <img src={URL.createObjectURL(files[0])} alt="preview" className="img-thumbnail" style={{ maxWidth: 180 }} />
        )}

        <input
          type="file"
          hidden
          ref={inputRef}
          accept={accept}
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
};

export default DropZone;
