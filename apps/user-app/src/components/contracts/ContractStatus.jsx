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
            toast.error(`Lỗi: ${error}`);
        }
    }, [error]);

    const currentTechnician = user?.technician || technician;
    if (!currentTechnician) {
        return null;
    }

    if (loading) {
        return <p>Đang kiểm tra trạng thái hợp đồng...</p>;
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
            .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt))
            .find(c => c.status === 'SIGNED')
        : null;

    if (contractToSign) {
        return (
            <div className="card text-center">
                <div className="card-header">Yêu cầu hành động</div>
                <div className="card-body">
                    <h5 className="card-title">Hợp đồng của bạn đã sẵn sàng</h5>
                    <p className="card-text">Vui lòng xem xét và ký hợp đồng dịch vụ để hoàn tất hồ sơ của bạn.</p>
                    <a href={contractToSign.signingUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
                        Xem xét và ký hợp đồng
                    </a>
                </div>
                <div className="card-footer text-muted">Trạng thái: Đang chờ chữ ký</div>
            </div>
        );
    }
    
    if (latestSignedContract) {
        return (
            <div className="alert alert-success" role="alert" style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                maxWidth: '300px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: '15px',
                borderRadius: '8px'
            }}>
                <h4 className="alert-heading">Hợp đồng đã được ký!</h4>
                <p>Hợp đồng của bạn đã được ký thành công vào ngày {new Date(latestSignedContract.signedAt).toLocaleDateString('vi-VN')} và đang có hiệu lực.</p>
            </div>
        );
    }

    if (currentTechnician.status === 'APPROVED' && !contractToSign && !latestSignedContract) {
        return (
            <div className="alert alert-info" role="alert" style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                maxWidth: '300px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                padding: '15px',
                borderRadius: '8px'
            }}>
                Hồ sơ của bạn đã được duyệt. Hợp đồng đang được quản trị viên chuẩn bị. Vui lòng kiểm tra lại sau.
            </div>
        );
    }
    
    // Default state if technician is not yet approved
    return (
        <div className="alert alert-warning" role="alert" style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            maxWidth: '300px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            padding: '15px',
            borderRadius: '8px'
        }}>
            Hồ sơ của bạn đang chờ duyệt từ quản trị viên.
        </div>
    );
};

export default ContractStatus;