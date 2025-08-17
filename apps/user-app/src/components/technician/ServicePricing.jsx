import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled from '@emotion/styled';
import apiClient from '../../services/apiClient';

// Styled Components
const PRIMARY_COLOR = '#f5a623';
const TEXT_COLOR = '#1c1c1c';
const MUTED_TEXT_COLOR = '#555555';
const BORDER_COLOR = '#e0e0e0';

const Container = styled.div`
  padding: 1rem 0;
`;

const InfoBanner = styled.div`
  background: ${props => props.type === 'error' ? '#fff3cd' : '#d1ecf1'};
  border: 1px solid ${props => props.type === 'error' ? '#ffeaa7' : '#bee5eb'};
  color: ${props => props.type === 'error' ? '#856404' : '#0c5460'};
  padding: 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  i {
    font-size: 1.25rem;
  }

  .banner-content {
    flex: 1;
  }

  .banner-title {
    font-weight: 600;
    margin: 0 0 0.25rem 0;
  }

  .banner-text {
    margin: 0;
    font-size: 0.9rem;
  }
`;

const ServiceCard = styled.div`
  background: #fff;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const ServiceHeader = styled.div`
  margin-bottom: 1rem;
`;

const ServiceTitle = styled.h6`
  margin: 0 0 0.5rem 0;
  color: ${TEXT_COLOR};
  font-weight: 600;
  font-size: 1.1rem;
`;

const PriceForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;
`;

const PriceDisplay = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const PriceInfo = styled.div`
  text-align: center;
  
  .label {
    font-weight: 500;
    color: ${MUTED_TEXT_COLOR};
    font-size: 0.85rem;
    margin-top: 0.25rem;
  }
  
  .value {
    color: ${TEXT_COLOR};
    font-weight: 600;
    font-size: 1.2rem;
  }
`;



const FormGroup = styled.div`
  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: ${TEXT_COLOR};
  }

  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 0.375rem;
    color: ${TEXT_COLOR};
    
    &:focus {
      outline: none;
      border-color: ${PRIMARY_COLOR};
      box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.2);
    }
  }
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;

  &.btn-primary {
    background-color: ${PRIMARY_COLOR};
    color: #1c1c1c;
    &:hover {
      filter: brightness(1.1);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${MUTED_TEXT_COLOR};
`;

const LastUpdated = styled.div`
  text-align: center;
  color: ${MUTED_TEXT_COLOR};
  font-size: 0.9rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${BORDER_COLOR};
`;

const SearchBar = styled.div`
  margin-bottom: 1rem;
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid ${BORDER_COLOR};
    border-radius: 0.375rem;
    background: #fff;
    color: ${TEXT_COLOR};
    
    &:focus {
      outline: none;
      border-color: ${PRIMARY_COLOR};
      box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.2);
    }
  }
`;

const CategoryGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid ${BORDER_COLOR};
  border-radius: 0.375rem;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: all 0.2s;
  
  &:hover {
    background: #e9ecef;
  }
  
  .category-title {
    font-weight: 600;
    color: ${TEXT_COLOR};
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .category-count {
    color: ${MUTED_TEXT_COLOR};
    font-size: 0.9rem;
  }
  
  .expand-icon {
    transition: transform 0.2s;
    
    &.expanded {
      transform: rotate(180deg);
    }
  }
`;

const ServicesContainer = styled.div`
  display: ${props => props.expanded ? 'block' : 'none'};
  margin-left: 1rem;
`;

const ServicePricing = () => {
  const [services, setServices] = useState([]);
  const [originalServices, setOriginalServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [eligibility, setEligibility] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [groupedServices, setGroupedServices] = useState({});

  // Fetch data khi component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch eligibility và services song song
      const [eligibilityRes, servicesRes] = await Promise.all([
        apiClient.get('/technician-services/check-update-eligibility'),
        apiClient.get('/technician-services/my-services')
      ]);

      if (eligibilityRes.data.success) {
        setEligibility(eligibilityRes.data.data);
      }

      if (servicesRes.data.success) {
        const servicesData = servicesRes.data.data.services || [];
        setServices(servicesData);
        setOriginalServices([...servicesData]); // Save original data for cancel
        setLastUpdated(servicesRes.data.data.lastUpdated);
        
        // Group services by category
        groupServicesByCategory(servicesData);
        
        // Expand all categories by default
        const allCategories = new Set(
          servicesData.map(service => service.serviceId?.categoryId?._id).filter(Boolean)
        );
        setExpandedCategories(allCategories);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  // Group services by category
  const groupServicesByCategory = (servicesData) => {
    const grouped = servicesData.reduce((acc, service) => {
      const categoryId = service.serviceId?.categoryId?._id || 'uncategorized';
      const categoryName = service.serviceId?.categoryId?.categoryName || 'Chưa phân loại';
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          categoryName,
          services: []
        };
      }
      
      acc[categoryId].services.push(service);
      return acc;
    }, {});
    
    setGroupedServices(grouped);
  };

  // Filter services by search term
  const getFilteredServices = () => {
    if (!searchTerm.trim()) return groupedServices;
    
    const filtered = {};
    Object.entries(groupedServices).forEach(([categoryId, categoryData]) => {
      const filteredServices = categoryData.services.filter(service =>
        service.serviceId?.serviceName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (filteredServices.length > 0) {
        filtered[categoryId] = {
          ...categoryData,
          services: filteredServices
        };
      }
    });
    
    return filtered;
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setServices([...originalServices]); // Restore original data
    groupServicesByCategory([...originalServices]); // Re-group original data
    setIsEditing(false);
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handlePriceChange = (serviceId, field, value) => {
    const updatedServices = services.map(service => 
      service.serviceId._id === serviceId 
        ? { ...service, [field]: field === 'price' ? Number(value) || 0 : Number(value) || 0 }
        : service
    );
    
    setServices(updatedServices);
    groupServicesByCategory(updatedServices); // Re-group after changes
  };

  const handleUpdatePrices = async () => {
    if (!eligibility?.canUpdate) {
      toast.error(eligibility?.message || 'Không thể cập nhật giá dịch vụ');
      return;
    }

    // Validate dữ liệu
    const validServices = services.filter(service => service.price > 0);
    if (validServices.length === 0) {
      toast.error('Vui lòng nhập giá cho ít nhất một dịch vụ');
      return;
    }

    try {
      setUpdating(true);

      const updateData = {
        services: validServices.map(service => ({
          serviceId: service.serviceId._id,
          price: service.price,
          warrantyDuration: service.warrantyDuration || 0
        }))
      };

      const response = await apiClient.put('/technician-services/update-prices', updateData);

      if (response.data.success) {
        toast.success('Cập nhật giá dịch vụ thành công!');
        setIsEditing(false); // Exit edit mode first
        await fetchData(); // Then refresh data and re-group
      }

    } catch (error) {
      console.error('Error updating prices:', error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật giá dịch vụ';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <LoadingSpinner>
        <i className="bi bi-hourglass-split me-2"></i>
        Đang tải dữ liệu...
      </LoadingSpinner>
    );
  }

  const filteredGroupedServices = getFilteredServices();
  const hasServices = Object.keys(filteredGroupedServices).length > 0;

  return (
    <Container>
      {/* Search Bar */}
      {services.length > 0 && (
        <SearchBar>
          <input
            type="text"
            placeholder="Tìm kiếm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBar>
      )}

      {/* Nút chỉnh sửa ở góc phải */}
      {!isEditing && eligibility?.canUpdate && hasServices && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <Button className="btn-primary" onClick={handleStartEdit}>
            <i className="bi bi-pencil-fill"></i>
            Chỉnh sửa
          </Button>
        </div>
      )}

      {/* Banner cảnh báo - chỉ khi không thể update */}
      {!eligibility?.canUpdate && eligibility && (
        <InfoBanner type="error">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div className="banner-content">
            <div className="banner-text">{eligibility.message}</div>
          </div>
        </InfoBanner>
      )}

      {/* Grouped Services */}
      {hasServices ? (
        <>
          {Object.entries(filteredGroupedServices).map(([categoryId, categoryData]) => (
            <CategoryGroup key={categoryId}>
              <CategoryHeader onClick={() => toggleCategory(categoryId)}>
                <div className="category-title">
                  <i className="bi bi-folder-fill"></i>
                  {categoryData.categoryName}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className="category-count">
                    {categoryData.services.length} dịch vụ
                  </span>
                  <i className={`bi bi-chevron-down expand-icon ${expandedCategories.has(categoryId) ? 'expanded' : ''}`}></i>
                </div>
              </CategoryHeader>
              
              <ServicesContainer expanded={expandedCategories.has(categoryId)}>
                {categoryData.services.map((service) => (
                  <ServiceCard key={service._id}>
                    <ServiceHeader>
                      <ServiceTitle>{service.serviceId.serviceName}</ServiceTitle>
                    </ServiceHeader>
                    
                    {isEditing ? (
                      <PriceForm>
                        <FormGroup>
                          <label>Giá dịch vụ (VNĐ)</label>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={service.price || ''}
                            onChange={(e) => handlePriceChange(service.serviceId._id, 'price', e.target.value)}
                            placeholder="Nhập giá dịch vụ"
                          />
                        </FormGroup>
                        
                        <FormGroup>
                          <label>Bảo hành (tháng)</label>
                          <input
                            type="number"
                            min="0"
                            max="60"
                            value={service.warrantyDuration || ''}
                            onChange={(e) => handlePriceChange(service.serviceId._id, 'warrantyDuration', e.target.value)}
                            placeholder="Số tháng bảo hành"
                          />
                        </FormGroup>
                      </PriceForm>
                    ) : (
                      <PriceDisplay>
                        <PriceInfo>
                          <div className="value">
                            {service.price ? `${service.price.toLocaleString('vi-VN')} VNĐ` : 'Chưa có giá'}
                          </div>
                          <div className="label">Giá dịch vụ</div>
                        </PriceInfo>
                        
                        <PriceInfo>
                          <div className="value">
                            {service.warrantyDuration ? `${service.warrantyDuration} tháng` : 'Không BH'}
                          </div>
                          <div className="label">Bảo hành</div>
                        </PriceInfo>
                      </PriceDisplay>
                    )}
                  </ServiceCard>
                ))}
              </ServicesContainer>
            </CategoryGroup>
          ))}

          {/* Nút cập nhật khi đang editing */}
          {isEditing && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              <Button 
                type="button" 
                style={{ backgroundColor: '#6c757d', color: 'white' }}
                onClick={handleCancelEdit}
                disabled={updating}
              >
                <i className="bi bi-x-circle"></i>
                Hủy
              </Button>
              <Button 
                className="btn-primary" 
                onClick={handleUpdatePrices}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <i className="bi bi-hourglass-split"></i>
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle"></i>
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Thông tin lần cập nhật cuối */}
          {!isEditing && lastUpdated && (
            <LastUpdated>
              Cập nhật cuối: {new Date(lastUpdated).toLocaleDateString('vi-VN')}
            </LastUpdated>
          )}
        </>
      ) : services.length > 0 ? (
        <InfoBanner type="info">
          <i className="bi bi-info-circle-fill"></i>
          <div className="banner-content">
            <div className="banner-text">
              Không tìm thấy dịch vụ nào phù hợp với từ khóa "{searchTerm}".
            </div>
          </div>
        </InfoBanner>
      ) : (
        <InfoBanner type="info">
          <i className="bi bi-info-circle-fill"></i>
          <div className="banner-content">
            <div className="banner-text">
              Chưa có dịch vụ nào. Liên hệ admin để được thêm dịch vụ.
            </div>
          </div>
        </InfoBanner>
      )}
    </Container>
  );
};

export default ServicePricing;
