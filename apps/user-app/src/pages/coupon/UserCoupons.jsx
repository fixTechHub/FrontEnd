import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCouponsThunk } from '../../features/coupons/couponSlice';
import { Badge, Form, Button, Spinner } from 'react-bootstrap';
import { formatDate } from '../../utils/formatDate';

const UserCoupons = ()=>{
  const dispatch = useDispatch();
  const { list:coupons, loading, error } = useSelector(state=>state.coupons);
  const { user } = useSelector(state => state.auth);

  const [search,setSearch]=useState('');
  const [typeFilter,setTypeFilter]=useState('ALL');
  const [statusFilter]=useState('ALL');
  const[page,setPage]=useState(0);
  const limit=6;

  useEffect(()=>{ 
    if (user?._id) {
      dispatch(fetchUserCouponsThunk(user._id));
    }
  },[dispatch, user?._id]);

  const filtered = useMemo(()=>{
    const now= new Date();
    return coupons.filter(c=>{
      let ok=true;
      if(typeFilter!=='ALL') ok &= c.type===typeFilter;
      if(search.trim()) ok &= c.code.toLowerCase().includes(search.trim().toLowerCase());
      return ok;
    });
  },[coupons,typeFilter,search]);

  const paginated = useMemo(()=>{
    return filtered.slice(page*limit,(page+1)*limit);
  },[filtered,page]);

  const cardBorder=(c)=> c.type==='PERCENT'?'#16a34a':'#d97706';
  const badgeClass=(c)=> c.type==='PERCENT'?'bg-success':'bg-warning';
  const valLabel=(c)=> c.type==='PERCENT'?`${c.value}%`: `${c.value.toLocaleString('vi-VN')}₫`;

  return(
    <div className="coupons-list-modern">
      <style jsx>{`
        .coupons-list-modern {
          padding: 2rem 0;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }
        
        .coupons-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .coupons-title {
          font-size: 2.5rem;
          font-weight: 900;
          background: linear-gradient(135deg, #ff6b6b, #ffa500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }
        
        .coupons-subtitle {
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
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }
        
        .filter-group {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 4.25rem;
          min-height: 4.25rem;
        }
        
        .filter-label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          letter-spacing: 0.025em;
          height: 1.25rem;
          line-height: 1.25rem;
          margin-top: auto;
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
          height: 2.5rem;
          box-sizing: border-box;
        }
        
        .filter-input:focus, .filter-select:focus {
          outline: none;
          border-color: #ff6b6b;
          box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1);
        }
        
        .search-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          height: 4.25rem;
          min-height: 4.25rem;
        }
        
        .clear-btn {
          background: linear-gradient(135deg, #6b7280, #4b5563);
          border: none;
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          height: 2.5rem;
          align-self: flex-end;
          margin-top: 1.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .clear-btn:hover {
          background: linear-gradient(135deg, #4b5563, #374151);
          transform: translateY(-1px);
        }
        
        .coupons-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        
        .coupon-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .coupon-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
        }
        
        .coupon-percent {
          border-left: 4px solid #16a34a;
        }
        
        .coupon-amount {
          border-left: 4px solid #d97706;
        }
        
        .coupon-value {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.375rem 0.75rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 700;
          color: white;
        }
        
        .value-percent {
          background: linear-gradient(135deg, #16a34a, #15803d);
        }
        
        .value-amount {
          background: linear-gradient(135deg, #d97706, #b45309);
        }
        
        .coupon-code {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.5rem;
          margin-right: 5rem;
        }
        
        .coupon-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }
        
        .coupon-details {
          display: grid;
          gap: 0.5rem;
        }
        
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f3f4f6;
          font-size: 0.875rem;
        }
        
        .detail-item:last-child {
          border-bottom: none;
        }
        
        .detail-label {
          color: #6b7280;
          font-weight: 500;
        }
        
        .detail-value {
          color: #1f2937;
          font-weight: 600;
        }
        
        .loading-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #6b7280;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: #ffffff;
          border: 2px dashed #e5e7eb;
          border-radius: 16px;
          margin-top: 2rem;
        }
        
        .empty-icon {
          font-size: 4rem;
          color: #d1d5db;
          margin-bottom: 1rem;
        }
        
        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #374151;
          margin-bottom: 0.5rem;
        }
        
        .empty-text {
          color: #6b7280;
          font-size: 1rem;
        }
        
        .error-state {
          text-align: center;
          padding: 2rem;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #dc2626;
          font-weight: 600;
        }
        
        .pagination-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
        }
        
        .pagination-btn {
          background: #ffffff;
          border: 1px solid #d1d5db;
          color: #374151;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .pagination-btn:hover:not(:disabled) {
          background: #f3f4f6;
          border-color: #9ca3af;
        }
        
        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>
      
      <div className="container">
        <div className="coupons-header">
          <h1 className="coupons-title">Phiếu giảm giá của tôi</h1>
          <p className="coupons-subtitle">Quản lý và sử dụng các phiếu giảm giá hiệu quả</p>
        </div>
        
        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Loại phiếu</label>
              <select 
                className="filter-select" 
                value={typeFilter} 
                onChange={e=>setTypeFilter(e.target.value)}
              >
              <option value="ALL">Tất cả</option>
                <option value="PERCENT">Giảm phần trăm</option>
                <option value="FIXED">Giảm tiền mặt</option>
              </select>
            </div>
            <div className="search-wrapper">
              <label className="filter-label">Tìm kiếm</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Nhập mã coupon..."
                value={search}
                onChange={e=>setSearch(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <button 
                className="clear-btn" 
                onClick={()=>{setSearch('');setTypeFilter('ALL');}}
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="loading-state">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Đang tải phiếu giảm giá...</p>
          </div>
        )}
        
        {!!error && (
          <div className="error-state">
            {error}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3 className="empty-title">Không có phiếu giảm giá</h3>
            <p className="empty-text">Bạn chưa có phiếu giảm giá nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        )}

        {!loading && paginated.length > 0 && (
          <div className="coupons-grid">
            {paginated.map(c => (
              <div 
                className={`coupon-card ${c.type === 'PERCENT' ? 'coupon-percent' : 'coupon-amount'}`} 
                key={c._id}
              >
                <div className={`coupon-value ${c.type === 'PERCENT' ? 'value-percent' : 'value-amount'}`}>
                  {valLabel(c)}
                </div>
                
                <h3 className="coupon-code">{c.code}</h3>
                
                {c.description && (
                  <p className="coupon-description">{c.description}</p>
                )}
                
                <div className="coupon-details">
                  <div className="detail-item">
                    <span className="detail-label">Giá trị</span>
                    <span className="detail-value">{valLabel(c)}</span>
                  </div>
                  
                  {c.maxDiscount && (
                    <div className="detail-item">
                      <span className="detail-label">Giảm tối đa</span>
                      <span className="detail-value">{c.maxDiscount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  
                  {c.minOrderValue > 0 && (
                    <div className="detail-item">
                      <span className="detail-label">Đơn tối thiểu</span>
                      <span className="detail-value">{c.minOrderValue.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <span className="detail-label">Hạn sử dụng</span>
                    <span className="detail-value">{formatDate(c.endDate)}</span>
                  </div>
            </div>
          </div>
          ))}
        </div>
        )}

        {/* pagination */}
        {filtered.length > limit && (
          <div className="pagination-controls">
            <button 
              className="pagination-btn" 
              disabled={page === 0} 
              onClick={() => setPage(p => p - 1)}
            >
              Trước
            </button>
            <span className="pagination-info">
              {page + 1} / {Math.ceil(filtered.length / limit)}
            </span>
            <button 
              className="pagination-btn" 
              disabled={(page + 1) * limit >= filtered.length} 
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCoupons;
