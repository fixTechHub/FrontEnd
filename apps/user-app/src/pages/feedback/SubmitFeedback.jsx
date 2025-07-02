import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { submitFeedbackThunk, clearMessages } from '../../features/feedbacks/feedbackSlice';

const SubmitFeedback = () => {
  const dispatch = useDispatch();
  const { bookingId } = useParams();
  const { loading, successMessage, errorMessage } = useSelector((state) => state.feedback);

  const [rating, setRating] = useState(5);
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);

  // ✅ Xử lý chọn file
  const handleFileChange = (e) => {
    const selectedFiles = [...e.target.files];
    setFiles(selectedFiles);
    console.log('Selected files:', selectedFiles);
  };

  // ✅ Xử lý submit form
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(clearMessages());

    const formData = new FormData();
    formData.append('rating', rating);
    formData.append('content', content);

    // ✅ ĐÂY LÀ ĐOẠN BẠN YÊU CẦU THÊM VÀO
    files.forEach((file) => formData.append('files', file)); // key 'files' phải trùng multer.array('files')

    dispatch(submitFeedbackThunk({ bookingId, formData }));
  };

  return (
    <div style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Submit Feedback for Booking #{bookingId}</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Rating (1-5):</label>
          <input
            type="number"
            min={1}
            max={5}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Content:</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Upload Images:</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
          <div style={{ marginTop: '10px' }}>
            {files.length > 0 && files.map((file, i) => (
              <p key={i}>{file.name}</p>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>

      {successMessage && <p style={{ color: 'green', marginTop: '15px' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red', marginTop: '15px' }}>{errorMessage}</p>}
    </div>
  );
};

export default SubmitFeedback;
