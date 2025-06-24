import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { approveTechnicianThunk } from '../../features/admin/adminSlice';


const ApproveTechnicianTest = () => {
    const [technicianId, setTechnicianId] = useState('');
    const dispatch = useDispatch();
    const { loading } = useSelector(state => state.admin);
    const { user } = useSelector(state => state.auth);

    const handleApprove = () => {
        if (!technicianId.trim()) {
            return;
        }
        dispatch(approveTechnicianThunk(technicianId));
        setTechnicianId('');
    };

    // // This component should only be visible to Admins
    // if (user?.role?.name !== 'ADMIN') {
    //     return <p>You do not have permission to view this component.</p>;
    // }

    return (
        <div className="card mt-4">
            <div className="card-header">
                <h3>Admin Test: Approve Technician</h3>
            </div>
            <div className="card-body">
                <p>Enter the ID of the technician you want to approve.</p>
                <div className="input-group mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Technician ID"
                        value={technicianId}
                        onChange={(e) => setTechnicianId(e.target.value)}
                        disabled={loading}
                    />
                    <button
                        className="btn btn-success"
                        type="button"
                        onClick={handleApprove}
                        disabled={loading}
                    >
                        {loading ? 'Approving...' : 'Approve'}
                    </button>
                </div>
                 <small className="form-text text-muted">
                    This will approve the technician, automatically generate their service contract, and send them a notification.
                </small>
            </div>
        </div>
    );
};

export default ApproveTechnicianTest; 