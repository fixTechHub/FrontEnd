// UploadCer.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadCertificate } from '../../features/technicians/technicianSlice';

export default function UploadCertificateForm({ technicianId }) {
  const dispatch = useDispatch();
  const { certificateUpload } = useSelector((s) => s.technician || { certificateUpload: {} });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Chỉ cho phép JPG, PNG hoặc PDF');
      return;
    }
    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleRemoveSelected = () => {
    setFile(null);
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return alert('Vui lòng chọn file');
    if (!technicianId) return alert('Không tìm thấy ID kỹ thuật viên');

    const formData = new FormData();
    formData.append('file', file);
    await dispatch(uploadCertificate({ formData, technicianId }));
  };

  return (
    <div>
      <div className="ucf-drop">
        <input
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          className="form-control"
          onChange={handleFileChange}
        />
        <p className="ucf-help">Chọn tệp (JPG/PNG/PDF). Dung lượng tối đa theo quy định BE.</p>
      </div>

      {file && (
        <div className="ucf-preview">
          {preview ? (
            <div className="ucf-thumb">
              <img src={preview} alt="Preview" />
              <button type="button" className="ucf-remove" onClick={handleRemoveSelected}>
                ✕
              </button>
            </div>
          ) : (
            <div className="ucf-meta">
              <strong>Đã chọn tệp PDF:</strong> {file.name}
              <div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger mt-2"
                  onClick={handleRemoveSelected}
                >
                  Xóa file
                </button>
              </div>
            </div>
          )}

          <div className="ucf-meta">
            <div><strong>Kích thước:</strong> {(file.size / 1024 / 1024).toFixed(2)} MB</div>
            <div><strong>Loại:</strong> {file.type}</div>
            <div className="ucf-actions">
              <button
                className="btn btn-success"
                onClick={handleUpload}
                disabled={certificateUpload?.loading}
              >
                {certificateUpload?.loading ? 'Đang tải lên...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {certificateUpload?.error && (
        <div className="alert alert-danger mt-3">
          <strong>Lỗi:</strong> {certificateUpload.error}
        </div>
      )}
      {certificateUpload?.fileUrl && !certificateUpload?.loading && (
        <div className="alert alert-success mt-3">
          <strong>Upload thành công:</strong>{' '}
          <a href={certificateUpload.fileUrl} target="_blank" rel="noreferrer">Xem tệp</a>
        </div>
      )}
    </div>
  );
}
