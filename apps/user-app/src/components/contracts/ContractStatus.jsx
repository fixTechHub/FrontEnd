import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchContractByTechnicianThunk } from '../../features/contracts/contractSlice';
import { toast } from 'react-toastify';

const ContractStatus = () => {
    const dispatch = useDispatch();
    const { technician, user } = useSelector((state) => state.auth);
    // The 'contract' from the slice is an array of contracts
    const { contract: contracts, loading, error } = useSelector((state) => state.contract);

    useEffect(() => {
        // Use user.technician._id if available, otherwise technician from auth slice
        const techId = user?.technician?._id || technician?._id;
        // Only fetch if we have a technician ID and contracts haven't been loaded yet
        if (techId && !contracts) {
            dispatch(fetchContractByTechnicianThunk(techId));
        }
    }, [dispatch, user?.technician?._id, technician?._id, contracts]);

    useEffect(() => {
        if (error && !error.includes('No contract found')) {
            toast.error(error);
        }
    }, [error]);

    const currentTechnician = user?.technician || technician;
    if (!currentTechnician) {
        return null;
    }

    if (loading) {
        return <p>Checking contract status...</p>;
    }

    // Find the most recent contract that is ready to be signed
    const contractToSign = Array.isArray(contracts)
        ? [...contracts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .find(c => (c.status === 'PENDING') && c.signingUrl)
        : null;
    
    // Find the most recent signed contract if no contract needs signing
    const latestSignedContract = !contractToSign && Array.isArray(contracts)
        ? [...contracts]
            .sort((a, b) => new Date(b.signedAt) - new Date(b.signedAt))
            .find(c => c.status === 'SIGNED' )
        : null;

    if (contractToSign) {
        return (
            <div className="card text-center">
                <div className="card-header">Action Required</div>
                <div className="card-body">
                    <h5 className="card-title">Your Contract is Ready</h5>
                    <p className="card-text">Please review and sign your service contract to complete your profile.</p>
                    <a href={contractToSign.signingUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        Review and Sign Contract
                    </a>
                </div>
                <div className="card-footer text-muted">Status: Awaiting Signature</div>
            </div>
        );
    }
    
    if (latestSignedContract) {
         return (
             <div className="alert alert-success" role="alert">
                <h4 className="alert-heading">Contract Signed!</h4>
                <p>Your contract has been successfully signed on {new Date(latestSignedContract.signedAt).toLocaleDateString()} and is active.</p>
            </div>
        );
    }

    if (currentTechnician.status === 'APPROVED' && !contractToSign && !latestSignedContract) {
         return (
            <div className="alert alert-info" role="alert">
                Your profile is approved. The contract is being prepared by the administrator. Please check back later.
            </div>
        );
    }
    
    // Default state if technician is not yet approved
    return (
        <div className="alert alert-warning" role="alert">
            Your profile is awaiting approval from an administrator.
        </div>
    );
};

export default ContractStatus; 