import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContractByTechnicianThunk } from "../../features/contracts/contractSlice";
import { toast } from "react-toastify";
import { Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardHeader } from 'react-bootstrap';
import { Button } from 'react-bootstrap';
import { Badge } from 'react-bootstrap';
import { Alert } from 'react-bootstrap';

// Material Design Icons from react-icons/md
import { MdDescription, MdCheckCircle, MdAccessTime, MdError, MdOpenInNew, MdCalendarToday, MdTimer, MdPerson } from 'react-icons/md';

// Helper function to calculate contract duration
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    return `${years} năm${diffDays % 365 > 0 ? ` và ${diffDays % 365} ngày` : ""}`;
  }
  return `${diffDays} ngày`;
};

const ContractStatus = () => {
  const dispatch = useDispatch();
  const { technician, user } = useSelector((state) => state.auth);
  const { contract: contracts, loading, error } = useSelector((state) => state.contract);

  useEffect(() => {
    const techId = user?.technician?._id || technician?._id;
    if (techId && !contracts) {
      dispatch(fetchContractByTechnicianThunk(techId));
    }
  }, [dispatch, user?.technician?._id, technician?._id, contracts]);

  useEffect(() => {
    if (error && !error.includes("No contract found")) {
      toast.error(`Lỗi: ${error}`);
    }
  }, [error]);

  const currentTechnician = user?.technician || technician;

  if (!currentTechnician) {
    return null;
  }

  if (loading) {
    return (
      <Card className="w-100" style={{ maxWidth: '672px', margin: '0 auto' }}>
        <CardBody className="d-flex align-items-center justify-content-center py-4">
          <div className="d-flex align-items-center">
            <div className="spinner-border text-primary me-2" role="status" style={{ width: '1.5rem', height: '1.5rem' }}></div>
            <span className="text-muted">Đang kiểm tra trạng thái hợp đồng...</span>
          </div>
        </CardBody>
      </Card>
    );
  }

  const contractToSign = Array.isArray(contracts)
    ? [...contracts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .find((c) => c.status === "PENDING" && c.signingUrl)
    : null;

  const latestSignedContract =
    !contractToSign && Array.isArray(contracts)
      ? [...contracts].sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt)).find((c) => c.status === "SIGNED")
      : null;

  // Contract ready to sign
  if (contractToSign) {
    return (
      <Card className="w-100 border-warning bg-gradient" style={{ maxWidth: '672px', margin: '0 auto', backgroundImage: 'linear-gradient(to bottom right, #fff3e0, #fef9c3)' }}>
        <CardHeader className="text-center pb-2">
          <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#ffedd5', borderRadius: '50%', margin: '0 auto' }}>
            <MdDescription size={32} className="text-warning" />
          </div>
          <CardTitle className="text-2xl font-bold text-warning">Hợp đồng sẵn sàng ký!</CardTitle>
          <CardSubtitle className="text-muted mt-1">Hợp đồng dịch vụ của bạn đã được chuẩn bị và đang chờ chữ ký</CardSubtitle>
        </CardHeader>

        <CardBody className="py-4">
          <Alert variant="warning" className="bg-light-warning border-warning">
            <MdError size={16} className="me-2 text-warning" />
            Vui lòng xem xét kỹ các điều khoản trong hợp đồng trước khi ký
          </Alert>

          <div className="text-center">
            <Button variant="warning" size="lg" className="px-4 py-2">
              <a
                href={contractToSign.signingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white text-decoration-none d-flex align-items-center justify-content-center"
              >
                <span>Xem xét và ký hợp đồng</span>
                <MdOpenInNew size={16} className="ms-2" />
              </a>
            </Button>
          </div>
        </CardBody>

        <CardFooter className="d-flex justify-content-center">
          <Badge bg="light" text="warning" className="border border-warning">
            <MdAccessTime size={12} className="me-1" />
            Đang chờ chữ ký
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  // Signed contract
  if (latestSignedContract) {
    const duration = calculateDuration(latestSignedContract.effectiveDate, latestSignedContract.expirationDate);

    return (
      <Card className="w-100 border-success bg-gradient" style={{ maxWidth: '672px', margin: '0 auto', backgroundImage: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)' }}>
        <CardHeader className="text-center pb-2">
          <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#d1fae5', borderRadius: '50%', margin: '0 auto' }}>
            <MdCheckCircle size={32} className="text-success" />
          </div>
          <CardTitle className="text-2xl font-bold text-success">Hợp đồng đã được ký!</CardTitle>
          <CardSubtitle className="text-muted mt-1">Chúc mừng! Hợp đồng của bạn đã có hiệu lực</CardSubtitle>
        </CardHeader>

        <CardBody className="py-4">
          <div className="row row-cols-1 row-cols-md-2 g-4">
            <div className="col">
              <div className="p-3 bg-light border border-success rounded">
                <div className="d-flex align-items-center mb-2">
                  <MdDescription size={16} className="text-success me-2" />
                  <span className="font-weight-medium text-success">Mã hợp đồng</span>
                </div>
                <p className="text-success font-monospace mb-0">#{latestSignedContract.contractCode}</p>
              </div>
            </div>

            <div className="col">
              <div className="p-3 bg-light border border-success rounded">
                <div className="d-flex align-items-center mb-2">
                  <MdCalendarToday size={16} className="text-success me-2" />
                  <span className="font-weight-medium text-success">Ngày ký</span>
                </div>
                <p className="text-success mb-0">{new Date(latestSignedContract.signedAt).toLocaleDateString("vi-VN")}</p>
              </div>
            </div>
          </div>

          <hr className="bg-success" />

          <div className="mt-3">
            <div className="d-flex align-items-start mb-3">
              <MdTimer size={20} className="text-success me-2 mt-1" />
              <div>
                <p className="font-weight-medium text-success mb-1">Thời gian hiệu lực</p>
                <p className="text-success small mb-0">
                  Từ {new Date(latestSignedContract.effectiveDate).toLocaleDateString("vi-VN")} đến{" "}
                  {new Date(latestSignedContract.expirationDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="d-flex align-items-start">
              <MdAccessTime size={20} className="text-success me-2 mt-1" />
              <div>
                <p className="font-weight-medium text-success mb-1">Thời hạn hợp đồng</p>
                <p className="text-success small mb-0">{duration}</p>
              </div>
            </div>
          </div>
        </CardBody>

        <CardFooter className="d-flex justify-content-center">
          <Badge bg="success" className="text-white">
            <MdCheckCircle size={12} className="me-1" />
            Đang có hiệu lực
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  // Approved technician waiting for contract
  if (currentTechnician.status === "APPROVED" && !contractToSign && !latestSignedContract) {
    return (
      <Card className="w-100 border-primary bg-gradient" style={{ maxWidth: '672px', margin: '0 auto', backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}>
        <CardHeader className="text-center pb-2">
          <div className="d-flex justify-content-center align-items-center mb-3" style={{ width: '64px', height: '64px', backgroundColor: '#dbeafe', borderRadius: '50%', margin: '0 auto' }}>
            <MdPerson size={32} className="text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Hồ sơ đã được duyệt!</CardTitle>
          <CardSubtitle className="text-muted mt-1">Chúng tôi đang chuẩn bị hợp đồng cho bạn</CardSubtitle>
        </CardHeader>

        <CardBody>
          <Alert variant="primary" className="bg-light-primary border-primary">
            <MdAccessTime size={16} className="me-2 text-primary" />
            Hợp đồng đang được quản trị viên chuẩn bị. Chúng tôi sẽ thông báo khi hợp đồng sẵn sàng để ký.
          </Alert>
        </CardBody>

        <CardFooter className="d-flex justify-content-center">
          <Badge bg="light" text="primary" className="border border-primary">
            <MdAccessTime size={12} className="me-1" />
            Đang chuẩn bị hợp đồng
          </Badge>
        </CardFooter>
      </Card>
    );
  }

  // Waiting for approval
  return (
    <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 50, maxWidth: '320px' }}>
      <Alert variant="warning" className="shadow bg-gradient" style={{ backgroundImage: 'linear-gradient(to right, #fef9c3, #fef3c7)' }}>
        <MdError size={16} className="me-2 text-warning" />
        <span className="fw-medium text-warning">Hồ sơ của bạn đang chờ duyệt từ quản trị viên.</span>
      </Alert>
    </div>
  );
};

export default ContractStatus;