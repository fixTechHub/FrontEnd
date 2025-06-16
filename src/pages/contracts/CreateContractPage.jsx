import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createEnvelopeThunk, clearContractError, clearContractState } from '../../features/contracts/contractSlice';
import { checkAuthThunk } from '../../features/auth/authSlice'; 
import { fetchTechnicians } from '../../features/technicians/technicianSlice';
const CreateContractPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { signingUrl, contractCode, loading, error } = useSelector((state) => state.contract);
  const { user, loading: authLoading, error: authError, isInitialized } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    technicianId: '',
    effectiveDate: '',
    expirationDate: ''
  });

  useEffect(() => {
    if (!isInitialized) {
      dispatch(checkAuthThunk());
    }
    if (!technicians && user?.role === 'ADMIN') {
      dispatch(fetchTechnicians()); // Fetch technicians if not loaded
    }
  }, [dispatch, isInitialized, technicians, user?.role]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || authLoading || !isInitialized) {
      alert('Please log in to sign a contract.');
      return;
    }

    if (user?.role !== 'admin') {
      alert('Only admins can create contracts.');
      return;
    }

    if (!formData.technicianId) {
      alert('Please select a technician.');
      return;
    }

    if (!file) {
      alert('Please upload a contract document.');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('technicianId', formData.technicianId);
      formDataToSend.append('effectiveDate', formData.effectiveDate);
      formDataToSend.append('expirationDate', formData.expirationDate);
      formDataToSend.append('document', file);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64String = reader.result.split(',')[1];
        formDataToSend.append('documentBase64', base64String);

        await dispatch(createEnvelopeThunk(formDataToSend)).unwrap();
      };
      reader.onerror = () => {
        dispatch(clearContractError());
        dispatch(clearContractState());
        alert('Failed to read file');
      };
    } catch (error) {
      console.error('Submit error:', error);
      dispatch(clearContractError());
      dispatch(clearContractState());
    }
  };

  useEffect(() => {
    if (signingUrl) {
      window.location.href = signingUrl;
    }
  }, [signingUrl]);

  useEffect(() => {
    return () => {
      dispatch(clearContractState());
    };
  }, [dispatch]);

  if (authLoading && !isInitialized) {
    return <div>Loading authentication...</div>;
  }

  if (authError) {
    return <div className="text-red-500 mb-4">Authentication error: {authError}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Contract (Admin)</h1>
      {contractCode && (
        <p className="mb-4">Contract Code: {contractCode}</p>
      )}
      {error && (
        <p className="text-red-500 mb-4">{error}</p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Select Technician</label>
          <select
            name="technicianId"
            value={formData.technicianId}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select a technician</option>
            {technicians?.map((tech) => (
              <option key={tech._id} value={tech._id}>
                {tech.name || tech.email} (ID: {tech._id})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Effective Date</label>
          <input
            type="date"
            name="effectiveDate"
            value={formData.effectiveDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Expiration Date</label>
          <input
            type="date"
            name="expirationDate"
            value={formData.expirationDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <div>
          <label className="block">Contract Document</label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || authLoading}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Create and Send for Signing'}
        </button>
      </form>
    </div>
  );
};

export default CreateContractPage;