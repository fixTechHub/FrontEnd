import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { message, Modal, Button } from 'antd';
import { technicianAPI } from '../../features/technicians/techniciansAPI';
import {
  setTechnicians,
  setLoading,
  setError,
  setFilters,
  updateTechnician,
} from '../../features/technicians/technicianSlice';
import {
  selectFilteredTechnicians,
  selectTechnicianFilters,
  selectTechnicianLoading,
  selectTechnicianError,
} from '../../features/technicians/technicianSelectors';
import { categoryAPI } from "../../features/categories/categoryAPI";

const TechnicianManagement = () => {
  const dispatch = useDispatch();
  const technicians = useSelector(selectFilteredTechnicians);
  const filters = useSelector(selectTechnicianFilters);
  const loading = useSelector(selectTechnicianLoading);
  const error = useSelector(selectTechnicianError);

  const [searchText, setSearchText] = useState(filters.search || '');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [statusData, setStatusData] = useState({ status: '', note: '' });
  const [showEditStatusModal, setShowEditStatusModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoryMap, setCategoryMap] = useState({});

  const fetchTechnicians = async () => {
    try {
      dispatch(setLoading(true));
      const data = await technicianAPI.getAll();
      dispatch(setTechnicians(data || []));
    } catch (err) {
      dispatch(setError(err.message || 'Failed to load technicians.'));
      message.error('Failed to load technicians.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, [dispatch]);

  useEffect(() => {
    dispatch(setFilters({ search: searchText }));
  }, [searchText, dispatch]);

  useEffect(() => {
    categoryAPI.getAll().then(data => {
      setCategories(data || []);
      const map = {};
      (data || []).forEach(cat => { 
        const key = cat._id?.$oid || cat._id || cat.id;
        map[key] = cat.categoryName || cat.name;
      });
      setCategoryMap(map);
      console.log("Categories:", data);
    });
  }, []);

  const handleOpenDetail = (technician) => {
    setSelectedTechnician(technician);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setShowDetailModal(false);
    setSelectedTechnician(null);
  };

  const handleOpenEditStatus = (technician) => {
    console.log('Technician được chọn để edit:', technician);
    setSelectedTechnician(technician);
    setStatusData({ status: technician.status || 'PENDING', note: technician.note || '' });
    setShowEditStatusModal(true);
  };

  const handleCloseEditStatus = () => {
    setShowEditStatusModal(false);
    setSelectedTechnician(null);
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setStatusData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedTechnician) return;
    try {
      dispatch(setLoading(true));
      console.log('--- Bắt đầu update status ---');
      await technicianAPI.updateStatus(selectedTechnician.id, statusData.status, statusData.note);
      console.log('--- Update status thành công, fetch lại list ---');
      await fetchTechnicians();
      console.log('--- Fetch xong, show message và đóng modal ---');
      message.success('Technician status updated successfully!');
      handleCloseEditStatus();
    } catch (err) {
      console.error('Update status error:', err);
      dispatch(setError(err.message || 'Failed to update status.'));
      message.error('Failed to update status: ' + (err.message || 'Unknown error'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content me-4">
        {/* Breadcrumb */}
        <div className="d-md-flex d-block align-items-center justify-content-between page-breadcrumb mb-3">
          <div className="my-auto mb-2">
            <h4 className="mb-1">Technicians</h4>
            <nav>
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/admin">Home</a></li>
                <li className="breadcrumb-item active">Technicians</li>
              </ol>
            </nav>
          </div>
        </div>
        {/* Search */}
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-3">
          <div className="top-search me-2">
            <div className="top-search-group">
              <span className="input-icon">
                <i className="ti ti-search"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search technicians"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Table */}
        <div className="custom-datatable-filter table-responsive">
          <table className="table datatable">
            <thead className="thead-light">
              <tr>
                <th>NAME</th>
                <th>EMAIL</th>
                <th>PHONE</th>
                <th>STATUS</th>
                <th>RATING</th>
                <th>JOBS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {technicians.map((tech) => (
                <tr key={tech.id}>
                  <td>{tech.fullName}</td>
                  <td>{tech.email}</td>
                  <td>{tech.phone}</td>
                  <td>
                    <span className={`badge badge-dark-transparent ${tech.status === 'APPROVED' ? 'text-success' : tech.status === 'REJECTED' ? 'text-danger' : 'text-warning'}`}>
                      <i className={`ti ti-point-filled ${tech.status === 'APPROVED' ? 'text-success' : tech.status === 'REJECTED' ? 'text-danger' : 'text-warning'} me-1`}></i>
                      {tech.status}
                    </span>
                  </td>
                  <td>{tech.ratingAverage?.toFixed(1) ?? '-'}</td>
                  <td>{tech.jobCompleted ?? 0}</td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <button className="btn btn-sm btn-primary" onClick={() => handleOpenEditStatus(tech)}>
                        <i className="ti ti-edit me-1"></i>Edit Status
                      </button>
                      <button className="btn btn-sm btn-info" onClick={() => handleOpenDetail(tech)}>
                        <i className="ti ti-eye me-1"></i>View Detail
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Detail Modal */}
      {showDetailModal && selectedTechnician && (
        <Modal
          open={showDetailModal}
          onCancel={handleCloseDetail}
          footer={null}
          title="Technician Detail"
        >
          <div><b>ID:</b> {selectedTechnician.id}</div>
          <div><b>Name:</b> {selectedTechnician.fullName}</div>
          <div><b>Email:</b> {selectedTechnician.email}</div>
          <div><b>Phone:</b> {selectedTechnician.phone}</div>
          <div><b>Specialization:</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {[...new Set(selectedTechnician.specialtiesCategories || [])].map(catIdRaw => {
                let catId = catIdRaw && typeof catIdRaw === 'object' && catIdRaw.$oid
                  ? catIdRaw.$oid
                  : (catIdRaw.id || catIdRaw._id || catIdRaw).toString().trim();
                return (
                  <span key={catId} className="badge bg-secondary mb-1">
                    {categoryMap[catId] || catId}
                  </span>
                );
              })}
            </div>
          </div>
          <div><b>Status:</b> {selectedTechnician.status}</div>
          <div><b>Rating:</b> {selectedTechnician.ratingAverage?.toFixed(1) ?? '-'}</div>
          <div><b>Jobs Completed:</b> {selectedTechnician.jobCompleted ?? 0}</div>
          <div><b>Note:</b> {selectedTechnician.note || '-'}</div>
        </Modal>
      )}
      {/* Edit Status Modal */}
      {showEditStatusModal && selectedTechnician && (
        <Modal
          open={showEditStatusModal}
          onCancel={handleCloseEditStatus}
          footer={null}
          title="Update Technician Status"
        >
          <form onSubmit={handleUpdateStatus}>
            <div className="mb-3">
              <label className="form-label">Status</label>
              <select name="status" className="form-select" value={statusData.status} onChange={handleStatusChange} required>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Note (Optional)</label>
              <textarea name="note" className="form-control" value={statusData.note} onChange={handleStatusChange} rows="3"></textarea>
            </div>
            <div className="d-flex justify-content-end">
              <button type="button" className="btn btn-light me-2" onClick={handleCloseEditStatus}>Cancel</button>
              <button type="submit" className="btn btn-primary">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
      
    </div>
  );
};

export default TechnicianManagement; 