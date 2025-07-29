// import { useDispatch, useSelector } from 'react-redux';
// import { uploadCertificate } from '../../features/technicians/technicianSlice';
// import { useState } from 'react';

// function UploadCertificateForm() {
//   const dispatch = useDispatch();
//   const { certificateUpload } = useSelector(state => state.technician);
//   const [file, setFile] = useState(null);

//   const handleUpload = () => {
//     if (!file) return alert('Vui lòng chọn file');
//     const formData = new FormData();
//     formData.append('certificate', file); // key phải khớp với Multer middleware bên BE
//     dispatch(uploadCertificate(formData));
//   };

//   return (
//     <div>
//       <input type="file" onChange={(e) => setFile(e.target.files[0])} />
//       <button onClick={handleUpload}>Upload</button>

//       {certificateUpload.loading && <p>Đang upload...</p>}
//       {certificateUpload.fileUrl && <p>Uploaded: {certificateUpload.fileUrl}</p>}
//       {certificateUpload.error && <p style={{ color: 'red' }}>{certificateUpload.error}</p>}
//     </div>
//   );
// }
// export default UploadCertificateForm;

import { useDispatch, useSelector } from 'react-redux';
import { uploadCertificate } from '../../features/technicians/technicianSlice';
import { useState } from 'react';

function UploadCertificateForm() {
  const dispatch = useDispatch();
  const { certificateUpload } = useSelector((state) => state.technician);
  const { technician } = useSelector((state) => state.auth);
  const technicianId = technician._id;
  console.log(technicianId);
  
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Chỉ cho phép định dạng JPG, PNG, hoặc PDF');
      return;
    }

    setFile(selectedFile);

    // Tạo preview nếu là ảnh
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleUpload = () => {
    if (!file) return alert('Vui lòng chọn file');
    if (!technicianId) return alert('Không tìm thấy ID kỹ thuật viên');

    const formData = new FormData();
    formData.append('file', file); // key phải khớp với middleware Multer
    console.log("FormData contains:", file);
    dispatch(uploadCertificate({ formData, technicianId }));
  };

  return (
    <div className="card p-3 mb-3">
      <h5 className="mb-3">Tải lên chứng chỉ</h5>

      <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="form-control mb-2" onChange={handleFileChange} />

      {preview && (
        <div className="mb-3">
          <p className="mb-1 fw-bold">Xem trước:</p>
          <img src={preview} alt="Preview" style={{ width: '150px', borderRadius: '5px' }} />
        </div>
      )}

      {!preview && file?.type === 'application/pdf' && (
        <div className="mb-3">
          <p className="mb-1 fw-bold">Đã chọn tệp PDF: {file.name}</p>
        </div>
      )}

      <button
        className="btn btn-success"
        onClick={handleUpload}
        disabled={certificateUpload.loading}
      >
        {certificateUpload.loading ? 'Đang tải lên...' : 'Upload'}
      </button>

      {certificateUpload.fileUrl && (
        <div className="mt-3 alert alert-success">
          <strong>Upload thành công:</strong>{' '}
          <a href={certificateUpload.fileUrl} target="_blank" rel="noopener noreferrer">
            Xem tệp
          </a>
        </div>
      )}

      {certificateUpload.error && (
        <div className="mt-3 alert alert-danger">
          <strong>Lỗi:</strong> {certificateUpload.error}
        </div>
      )}
    </div>
  );
}

export default UploadCertificateForm;
