import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../../services/apiClient';
import { formatDateOnly, formatTimeOnly } from '../../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import {
  RiShieldCheckFill as Shield,
  RiTimeFill as Clock,
  RiSearchLine as Search,
  RiFilterLine as Filter,
  RiCloseLine as Close,
  RiEyeLine as Eye,
  RiCalendarFill as Calendar,
  RiFileListFill as FileList,
  RiCheckboxCircleFill as Success,
  RiCloseCircleFill as Denied,
  RiTimeLine as Pending,
  RiLoader4Line as Loading,
  RiArrowLeftLine as ArrowLeft,
  RiArrowRightLine as ArrowRight,
  RiInboxLine as Empty
} from 'react-icons/ri';

const statusConfig = {
  PENDING: {
    label: 'Đang chờ',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    icon: Pending
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    icon: Success
  },
  IN_PROGRESS: {
    label: 'Đang xử lý',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    icon: Loading
  },
  RESOLVED: {
    label: 'Đã xử lý',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: Success
  },
  DENIED: {
    label: 'Từ chối',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    icon: Denied
  },
  DONE: {
    label: 'Hoàn tất',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    icon: Success
  }
};

const WarrantyList=()=>{
  const navigate = useNavigate();
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[list,setList]=useState([]);

  // filters
  const[statusFilter,setStatusFilter]=useState('ALL');
  const[page,setPage]=useState(0);
  const limit=6;
  const[fromDate,setFromDate]=useState('');
  const[toDate,setToDate]=useState('');
  const[search,setSearch]=useState('');

  useEffect(()=>{
    const fetch=async()=>{
      try{
        setLoading(true);
        const res = await apiClient.get('/warranties');
       
        const arr = Array.isArray(res.data) ? res.data : res.data.warranties || [];
        setList(arr);
      }catch(err){
        setError(err?.response?.data?.error||'Lỗi');
      }finally{
        setLoading(false);
      }
    };
    fetch();
  },[]);

  const filtered = useMemo(()=>{
    return list.filter(w=>{
      let ok=true;
      if(statusFilter!=='ALL') ok &= w.status===statusFilter;
      if(fromDate) ok &= new Date(w.createdAt)>=new Date(fromDate);
      if(toDate) ok &= new Date(w.createdAt)<=new Date(toDate+'T23:59:59');
      if(search.trim()){
        const key=search.trim().toLowerCase();
        const code=(w.code||'').toLowerCase();
        const bookingCode=(w.bookingId?.bookingCode||'').toLowerCase();
        ok &= code.includes(key)||bookingCode.includes(key);
      }
      return ok;
    });
  },[list,statusFilter,fromDate,toDate,search]);

  const paginated = useMemo(()=>{
    return filtered.slice(page*limit,(page+1)*limit);
  },[filtered,page]);

  useEffect(()=>{setPage(0);},[filtered]);

  return(
    <div className="warranty-list-modern">
      <style jsx>{`
        .warranty-list-modern {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .warranty-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .warranty-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        
        .warranty-subtitle {
          color: #64748b;
          font-size: 1.1rem;
          font-weight: 500;
        }
        
        .filters-section {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 0.75rem;
          align-items: end;
        }
        
        .filter-group {
          position: relative;
        }
        
        .filter-label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.375rem;
          font-size: 0.75rem;
        }
        
        .filter-input, .filter-select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
          background: #ffffff;
          color: #374151;
        }
        
        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .search-wrapper {
          position: relative;
          min-width: 280px;
          grid-column: span 2;
        }
        
        .search-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.875rem;
          transition: border-color 0.2s ease;
          background: #ffffff;
          color: #374151;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .search-input::placeholder {
          color: #9ca3af;
        }
        
        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem 0.75rem;
          border: 1px solid #ef4444;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          background: #ffffff;
          color: #ef4444;
          white-space: nowrap;
        }
        
        .filter-btn:hover {
          background: #ef4444;
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);
        }
        
        .warranty-list {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 107, 107, 0.1);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 3rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .warranty-list-header {
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          border-bottom: 2px solid #ff6b6b;
          color: white;
          padding: 1rem 1.5rem;
          display: grid;
          grid-template-columns: 2fr 2fr 2fr 1.5fr 1fr;
          gap: 1rem;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        
        .warranty-item {
          display: grid;
          grid-template-columns: 2fr 2fr 2fr 1.5fr 1fr;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f3f4f6;
          align-items: center;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .warranty-item:last-child {
          border-bottom: none;
        }
        
        .warranty-item:hover {
          background: #f9fafb;
        }
        
        .warranty-item::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        
        .warranty-item:hover::before {
          opacity: 1;
        }
        
        .warranty-code-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .warranty-code {
          font-size: 1rem;
          font-weight: 900;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .warranty-booking-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .warranty-booking {
          font-size: 0.875rem;
          color: #374151;
          font-weight: 600;
        }
        
        .warranty-date-section {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .warranty-date {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #4b5563;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .warranty-time {
          font-size: 0.75rem;
          color: #9ca3af;
          font-weight: 500;
        }
        
        .warranty-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          width: fit-content;
        }
        
        .warranty-actions {
          display: flex;
          justify-content: center;
        }
        
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 0.875rem;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          box-shadow: 0 1px 3px rgba(255, 107, 107, 0.3);
        }
        
        .action-btn:hover {
          background: linear-gradient(135deg, #ffa500, #ff8500);
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(255, 107, 107, 0.4);
        }
        
        .loading-state, .error-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 20px;
          margin: 2rem 0;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          color: #ff6b6b;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        
        .error-icon, .empty-icon {
          width: 64px;
          height: 64px;
          margin-bottom: 1.5rem;
          color: #9ca3af;
        }
        
        .pagination-section {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }
        
        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 107, 107, 0.2);
          border-radius: 12px;
          color: #374151;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: rgba(255, 107, 107, 0.1);
          border-color: #ff6b6b;
          transform: translateY(-2px);
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          font-weight: 700;
          color: #374151;
          padding: 0.75rem 1.5rem;
          background: rgba(255, 107, 107, 0.1);
          border-radius: 12px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .warranty-title { font-size: 2rem; }
          .filters-grid { grid-template-columns: 1fr; }
          .filter-actions { flex-direction: column; }
          
          .warranty-list-header {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }
          
          .warranty-item {
            grid-template-columns: 1fr;
            gap: 1rem;
            text-align: left;
          }
          
          .warranty-item:hover {
            transform: none;
          }
          
          .warranty-actions {
            justify-content: stretch;
          }
          
          .action-btn {
            width: 100%;
            justify-content: center;
          }
        }
        
        @media (max-width: 1024px) {
          .warranty-list-header {
            grid-template-columns: 2fr 2fr 1fr;
            gap: 0.75rem;
          }
          
          .warranty-item {
            grid-template-columns: 2fr 2fr 1fr;
            gap: 0.75rem;
          }
          
          .warranty-date-section {
            grid-column: 1 / -1;
            margin-top: 0.5rem;
            padding-top: 0.5rem;
            border-top: 1px solid rgba(255, 107, 107, 0.1);
          }
        }
      `}</style>

      <div className="container-xl">
        {/* Header */}
        <div className="warranty-header">
          <h1 className="warranty-title">Yêu cầu bảo hành</h1>
          <p className="warranty-subtitle">Quản lý và theo dõi tình trạng yêu cầu bảo hành của bạn</p>
        </div>

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Trạng thái</label>
              <select 
                className="filter-select" 
                value={statusFilter} 
                onChange={e=>setStatusFilter(e.target.value)}
              >
                <option value="ALL">Tất cả</option>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <option key={key} value={key}>{config.label}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Từ ngày</label>
              <input 
                type="date" 
                className="filter-input"
                value={fromDate} 
                onChange={e=>setFromDate(e.target.value)} 
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label">Đến ngày</label>
              <input 
                type="date" 
                className="filter-input"
                value={toDate} 
                onChange={e=>setToDate(e.target.value)} 
              />
            </div>
            
            <div className="filter-group search-wrapper">
              <label className="filter-label">Tìm kiếm</label>
              <input 
                type="text"
                className="search-input"
                placeholder="Mã bảo hành, mã đặt lịch..."
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
              />
            </div>
            
            <div className="filter-group">
              <label className="filter-label" style={{opacity: 0}}>Action</label>
              <button 
                className="filter-btn"
                onClick={()=>{setStatusFilter('ALL');setFromDate('');setToDate('');setSearch('');}}
              >
                <Close size={12} />
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <Loading size={48} className="loading-spinner" />
            <h3>Đang tải dữ liệu...</h3>
            <p>Vui lòng chờ trong giây lát</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <Denied size={64} className="error-icon" />
            <h3>Có lỗi xảy ra</h3>
            <p>{error}</p>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Empty State */}
            {filtered.length === 0 && (
              <div className="empty-state">
                <Empty size={64} className="empty-icon" />
                <h3>Chưa có yêu cầu bảo hành</h3>
                <p>Bạn chưa tạo yêu cầu bảo hành nào hoặc không có kết quả phù hợp với bộ lọc</p>
              </div>
            )}

            {/* Warranty List */}
            {filtered.length > 0 && (
              <div className="warranty-list">
                <div className="warranty-list-header">
                  <div>Mã bảo hành</div>
                  <div>Đơn đặt lịch</div>
                  <div>Ngày yêu cầu</div>
                  <div>Trạng thái</div>
                  <div>Thao tác</div>
                </div>
                
                {paginated.map(warranty => {
                  const config = statusConfig[warranty.status] || statusConfig.PENDING;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div key={warranty._id} className="warranty-item">
                      <div className="warranty-code-section">
                        <div className="warranty-code">
                          <Shield size={16} style={{ color: '#ff6b6b' }} />
                          #{warranty.code || warranty._id.slice(-6)}
                        </div>
                      </div>
                      
                      <div className="warranty-booking-section">
                        <div className="warranty-booking">
                          {warranty.bookingId?.bookingCode || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="warranty-date-section">
                        <div className="warranty-date">
                          <Calendar size={14} style={{ color: '#ffa500' }} />
                          {formatDateOnly(warranty.createdAt)}
                        </div>
                        <div className="warranty-time">
                          <Clock size={12} style={{ color: '#ffa500' }} />
                          {formatTimeOnly(warranty.createdAt)}
                        </div>
                      </div>
                      
                      <div 
                        className="warranty-status"
                        style={{
                          backgroundColor: config.bgColor,
                          color: config.color
                        }}
                      >
                        <StatusIcon size={14} />
                        {config.label}
                      </div>
                      
                      <div className="warranty-actions">
                        <button
                          className="action-btn"
                          onClick={() => navigate(`/warranty?bookingWarrantyId=${warranty._id}`)}
                        >
                          <Eye size={16} />
                          Xem
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {filtered.length > limit && (
              <div className="pagination-section">
                <button 
                  className="pagination-btn"
                  disabled={page === 0}
                  onClick={() => setPage(p => p - 1)}
                >
                  <ArrowLeft size={16} />
                  Trước
                </button>
                
                <div className="pagination-info">
                  {page + 1} / {Math.ceil(filtered.length / limit)}
                </div>
                
                <button 
                  className="pagination-btn"
                  disabled={(page + 1) * limit >= filtered.length}
                  onClick={() => setPage(p => p + 1)}
                >
                  Sau
                  <ArrowRight size={16} />
                </button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default WarrantyList;
