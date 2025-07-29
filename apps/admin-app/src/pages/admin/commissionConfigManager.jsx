import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCommissionConfigs,
  createCommissionConfig,
  clearError
} from '../../features/commission/commissionSlice';

const CommissionConfigManager = () => {
  const dispatch = useDispatch();
  const { configs , loading , error }  = useSelector(state => {
    return state.commission
  });
  

  const [formData, setFormData] = useState({
    commissionPercent: '',
    holdingPercent: '',
    commissionMinAmount: '',
    commissionType: 'PERCENT',
    startDate: new Date().toISOString().split('T')[0],
    isApplied: true
  });

  // ← FIXED: Chỉ 1 useEffect
     useEffect(() => {
    dispatch(fetchCommissionConfigs());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert string to number for numeric fields
    const submitData = {
      ...formData,
      commissionPercent: parseFloat(formData.commissionPercent),
      holdingPercent: parseFloat(formData.holdingPercent),
      commissionMinAmount: formData.commissionMinAmount ? parseFloat(formData.commissionMinAmount) : 0
    };

    dispatch(createCommissionConfig(submitData));
    
    // ← FIXED: Reset form đúng structure
    setFormData({
      commissionPercent: '',
      holdingPercent: '',
      commissionMinAmount: '',
      commissionType: 'PERCENT',
      startDate: new Date().toISOString().split('T')[0],
      isApplied: true
    });
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return (
    <div>
      <h2>Cấu hình Hoa hồng</h2>
      
      {loading && <p>Đang tải...</p>}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          {error}
          <button onClick={handleClearError} style={{ marginLeft: '10px' }}>
            Đóng
          </button>
        </div>
      )}

      <div>
        <h3>Danh sách cấu hình:</h3>
        {configs && configs.length > 0 ? (
          <ul>
            {configs.map((config) => (
              <li key={config._id}>
                {config.commissionType} - {config.commissionPercent}% | 
                Giữ lại: {config.holdingPercent}% | 
                Áp dụng từ: {new Date(config.startDate).toLocaleDateString()} |
                Trạng thái: {config.isApplied ? 'Đang áp dụng' : 'Không áp dụng'}
              </li>
            ))}
          </ul>
        ) : (
          <p>Chưa có cấu hình nào</p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="number"
            placeholder="Tỷ lệ hoa hồng (%)"
            value={formData.commissionPercent}
            onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
            required
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        
        <div>
          <input
            type="number"
            placeholder="Tỷ lệ giữ lại (%)"
            value={formData.holdingPercent}
            onChange={(e) => setFormData({ ...formData, holdingPercent: e.target.value })}
            required
            min="0"
            max="100"
            step="0.01"
          />
        </div>
        
        <div>
          <input
            type="number"
            placeholder="Hoa hồng tối thiểu (tuỳ chọn)"
            value={formData.commissionMinAmount}
            onChange={(e) => setFormData({ ...formData, commissionMinAmount: e.target.value })}
            min="0"
            step="0.01"
          />
        </div>
        
        <div>
          <select
            value={formData.commissionType}
            onChange={(e) => setFormData({ ...formData, commissionType: e.target.value })}
          >
            <option value="PERCENT">PERCENT</option>
            <option value="MIN_AMOUNT">MIN_AMOUNT</option>
          </select>
        </div>
        
        <div>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        
        <div>
          <label>
            <input
              type="checkbox"
              checked={formData.isApplied}
              onChange={(e) => setFormData({ ...formData, isApplied: e.target.checked })}
            />
            Đang áp dụng?
          </label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Đang thêm...' : 'Thêm'}
        </button>
      </form>
    </div>
  );
};

export default CommissionConfigManager;