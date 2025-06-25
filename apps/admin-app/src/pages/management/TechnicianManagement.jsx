import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message } from 'antd';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import { setTechnicians, setFilters, setLoading, setError } from '../../features/technicians/technicianSlice';
import { selectFilteredTechnicians, selectTechnicianFilters } from '../../features/technicians/technicianSelectors';

const TechnicianManagement = () => {
  const dispatch = useDispatch();
    const filteredTechnicians = useSelector(selectFilteredTechnicians);
    const { search } = useSelector(selectTechnicianFilters);

    const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
    const [statusData, setStatusData] = useState({ status: '', note: '' });

    const fetchTechnicians = async () => {
      try {
        dispatch(setLoading(true));
            const techniciansData = await technicianAPI.getAll();
            dispatch(setTechnicians(techniciansData || []));
        } catch (err) {
            dispatch(setError(err.message));
            message.error('Failed to load technicians.');
      } finally {
        dispatch(setLoading(false));
      }
    };

    useEffect(() => {
    fetchTechnicians();
  }, [dispatch]);

    const handleOpenModal = (technician) => {
        setSelectedTechnician(technician);
        setStatusData({ 
            status: technician.status || 'APPROVED', // Default to APPROVED
            note: technician.note || '' 
        });
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedTechnician(null);
    };

    const handleChange = (e) => {
        setStatusData({ ...statusData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedTechnician) return;

        try {
            dispatch(setLoading(true));
            await technicianAPI.updateStatus(selectedTechnician.id, statusData.status, statusData.note);
            message.success('Technician status updated successfully!');
            handleCancel();
            fetchTechnicians(); // Refresh data
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to update status.';
            dispatch(setError(errorMessage));
            message.error(errorMessage);
        } finally {
            dispatch(setLoading(false));
        }
    };

    return (
        <div className="page-wrapper">
            <div className="content container-fluid">
                <div className="page-header">
                    <div className="row">
                        <div className="col-sm-12">
                            <h3 className="page-title">List of Technicians</h3>
                            <ul className="breadcrumb">
                                <li className="breadcrumb-item"><a href="/admin">Dashboard</a></li>
                                <li className="breadcrumb-item active">Technicians</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-sm-12">
                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover table-center mb-0 datatable">
                                        <thead>
                                            <tr>
                                                <th>Technician</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Specialization</th>
                                                <th>Status</th>
                                                <th className="text-end">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredTechnicians.map((technician) => (
                                                <tr key={technician.id}>
                                                    <td>
                                                        <h2 className="table-avatar">
                                                            <a href="#" className="avatar avatar-sm me-2">
                                                                <img className="avatar-img rounded-circle" src={technician.avatar || `https://i.pravatar.cc/150?u=${technician.id}`} alt="User Image" />
                                                            </a>
                                                            <a href="#">{technician.fullName}</a>
                                                        </h2>
                                                    </td>
                                                    <td>{technician.email}</td>
                                                    <td>{technician.phone}</td>
                                                    <td>{technician.specialization}</td>
                                                    <td>
                                                        <span className={`badge badge-pill bg-${
                                                            technician.status === 'APPROVED' ? 'success'
                                                            : technician.status === 'REJECTED' ? 'danger'
                                                            : 'warning'
                                                        }-light`}>
                                                            {technician.status || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="text-end">
                                                        <button className="btn btn-sm bg-success-light me-2" onClick={() => handleOpenModal(technician)}>
                                                            <i className="fe fe-pencil"></i> Edit Status
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Status Modal */}
            {isModalOpen && (
                <div className="modal fade show" style={{ display: 'block' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">Update Technician Status</h5>
                                    <button type="button" className="btn-close" onClick={handleCancel}></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Status</label>
                                                <select name="status" className="form-control" value={statusData.status} onChange={handleChange}>
                                                    <option value="PENDING">PENDING</option>
                                                    <option value="APPROVED">APPROVED</option>
                                                    <option value="REJECTED">REJECTED</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="mb-3">
                                                <label className="form-label">Note (Optional)</label>
                                                <textarea name="note" className="form-control" value={statusData.note} onChange={handleChange} rows="3"></textarea>
                                            </div>
        </div>
              </div>
              </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
                                    <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
                            </form>
              </div>
              </div>
              </div>
            )}
    </div>
  );
};

export default TechnicianManagement; 