import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createContractThunk } from '../../features/contracts/contractSlice'; // Adjust the path
import { Navigate } from 'react-router-dom';

const ContractPage = () => {
  const dispatch = useDispatch();
  const { user,technician, isAuthenticated, loading } = useSelector((state) => state.auth);
  const [signingUrl, setSigningUrl] = useState(null);
  const [error, setError] = useState(null);  
  
  const handleCreateContract = async () => {
    if (!user) return;

    const fullAddress = `${user?.address?.street || ''}, ${user?.address?.district || ''}, ${user?.address?.city || ''}`.trim();

    const contractData = {
      fullName: user.fullName,
      email: user.email,
      address: fullAddress,
      idNumber: user.idNumber || 'Unknown', // Replace with real source if available
      effectiveDate: new Date(),
      content: 'This is the default contract content.',
      technicianId: '68522a1fd35278762647b7a6'
    };

    const resultAction = await dispatch(createContractThunk(contractData));
    if (createContractThunk.fulfilled.match(resultAction)) {
      setSigningUrl(resultAction.payload.signingUrl);
    } else {
      setError(resultAction.payload || 'Failed to create contract');
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="contract-page">
      <h1>Contract Generation</h1>

      {signingUrl ? (
        <div>
          <p>Contract generated successfully.</p>
          <a href={signingUrl} target="_blank" rel="noopener noreferrer">
            Click here to sign the contract
          </a>
        </div>
      ) : (
        <div>
          <p>Hello, <strong>{user.fullName}</strong></p>
          <p>Email: {user.email}</p>
          <p>Address: {`${user?.address?.street}, ${user?.address?.district}, ${user?.address?.city}`}</p>
          <button onClick={handleCreateContract} disabled={loading}>
            {loading ? 'Generating Contract...' : 'Generate and Sign Contract'}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default ContractPage;
