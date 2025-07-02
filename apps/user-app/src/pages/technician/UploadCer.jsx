import { useDispatch, useSelector } from 'react-redux';
import { uploadCertificate } from '../../features/technicians/technicianSlice';
import { useState } from 'react';

function UploadCertificateForm() {
  const dispatch = useDispatch();
  const { certificateUpload } = useSelector(state => state.technician);
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert('Vui lòng chọn file');
    const formData = new FormData();
    formData.append('certificate', file); // key phải khớp với Multer middleware bên BE
    dispatch(uploadCertificate(formData));
  };

  return (
    <div>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>

      {certificateUpload.loading && <p>Đang upload...</p>}
      {certificateUpload.fileUrl && <p>Uploaded: {certificateUpload.fileUrl}</p>}
      {certificateUpload.error && <p style={{ color: 'red' }}>{certificateUpload.error}</p>}
    </div>
  );
}
export default UploadCertificateForm;