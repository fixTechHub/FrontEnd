"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchContractByTechnicianThunk } from "../../features/contracts/contractSlice"
import { toast } from "react-toastify"
import { Card, CardBody, CardTitle, CardSubtitle, CardFooter, CardHeader } from "react-bootstrap"
import { Button, Container, Row, Col } from "react-bootstrap"
import { Badge } from "react-bootstrap"
import { Alert } from "react-bootstrap"
import {
  MdDescription,
  MdCheckCircle,
  MdAccessTime,
  MdError,
  MdOpenInNew,
  MdCalendarToday,
  MdTimer,
  MdPerson,
  MdShield,
} from "react-icons/md"

// Helper function to calculate contract duration
const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365)
    return `${years} năm${diffDays % 365 > 0 ? ` và ${diffDays % 365} ngày` : ""}`
  }
  return `${diffDays} ngày`
}

const ContractStatus = () => {
  const dispatch = useDispatch()
  const { technician, user } = useSelector((state) => state.auth)
  const { contract: contracts, loading, error } = useSelector((state) => state.contract)
  console.log("Technician:", technician)
  console.log("Loading:", loading)
  console.log("Contracts:", contracts)
  console.log("Error:", error)

  useEffect(() => {
    const techId = user?.technician?._id || technician?._id
    if (techId && (!contracts || contracts.length === 0)) {
      dispatch(fetchContractByTechnicianThunk(techId))
    }
  }, [dispatch, user?.technician?._id, technician?._id, contracts])

  useEffect(() => {
    if (error && !error.includes("No contract found")) {
      toast.error(`Lỗi: ${error}`)
    }
  }, [error])

  const currentTechnician = user?.technician || technician
  console.log("Technician Status:", currentTechnician?.status)

  if (!currentTechnician) {
    return null
  }

  if (loading) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f0f9ff 100%)",
        }}
      >
        <Card
          className="border-0 shadow"
          style={{
            maxWidth: "320px",
            width: "100%",
            borderRadius: "12px",
          }}
        >
          <CardBody className="text-center py-4">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "60px",
                height: "60px",
                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                borderRadius: "50%",
                animation: "pulse 2s infinite",
              }}
            >
              <div className="spinner-border text-white" role="status" style={{ width: "1.5rem", height: "1.5rem" }}>
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h6 className="fw-bold text-primary mb-2">Đang kiểm tra trạng thái</h6>
            <p className="text-muted mb-0 small">Vui lòng chờ...</p>
          </CardBody>
        </Card>
      </div>
    )
  }

  const contractToSign = Array.isArray(contracts)
    ? [...contracts]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .find((c) => c.status === "PENDING" && c.signingUrl)
    : null

  const latestSignedContract =
    !contractToSign && Array.isArray(contracts)
    ? [...contracts]
        .sort((a, b) => new Date(b.signedAt) - new Date(a.signedAt))
        .find((c) => c.status === "SIGNED")
    : null

  const expiredContracts =
    Array.isArray(contracts) && contracts.length > 0
      ? contracts.filter(
          (c) => c.status === "EXPIRED" || new Date(c.expirationDate) < new Date()
        )
      : []

  // No contracts exist
  if (Array.isArray(contracts) && contracts.length === 0) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} xl={5}>
              <Card
                className="border-0 shadow"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                }}
              >
                <CardHeader className="text-center border-0 pt-4 pb-2" style={{ background: "transparent" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #6b7280, #4b5563)",
                      borderRadius: "50%",
                      boxShadow: "0 10px 20px rgba(107, 114, 128, 0.3)",
                    }}
                  >
                    <div
                      className="position-absolute"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(107, 114, 128, 0.2)",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    ></div>
                    <MdDescription size={30} className="text-white position-relative" />
                  </div>
                  <CardTitle className="fs-4 fw-bold text-gray-600 mb-2">Không có hợp đồng</CardTitle>
                  <CardSubtitle className="fs-6 text">
                    Hiện tại không có hợp đồng nào cho kỹ thuật viên này.
                  </CardSubtitle>
                </CardHeader>
                <CardBody className="px-4 py-3">
                  <Alert
                    variant="info"
                    className="border-0"
                    style={{
                      background: "linear-gradient(135deg, #e0f2fe, #bae6fd)",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <MdError size={16} className="text-info me-2" />
                      <span className="fw-medium small">
                        Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
                      </span>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // Expired contracts
  if (expiredContracts.length > 0 && !contractToSign && !latestSignedContract) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: "linear-gradient(135deg, #fef3e2 0%, #fef9c3 50%, #fef3e2 100%)",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} xl={5}>
              <Card
                className="border-0 shadow"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ffffff 0%, #fefbf3 100%)",
                }}
              >
                <CardHeader className="text-center border-0 pt-4 pb-2" style={{ background: "transparent" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                      borderRadius: "50%",
                      boxShadow: "0 10px 20px rgba(239, 68, 68, 0.3)",
                    }}
                  >
                    <div
                      className="position-absolute"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(239, 68, 68, 0.2)",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    ></div>
                    <MdError size={30} className="text-white position-relative" />
                  </div>
                  <CardTitle className="fs-4 fw-bold text-danger mb-2">Hợp đồng đã hết hạn</CardTitle>
                  <CardSubtitle className="fs-6 text-muted">
                    Một hoặc nhiều hợp đồng của bạn đã hết hạn.
                  </CardSubtitle>
                </CardHeader>
                <CardBody className="px-4 py-3">
                  <Alert
                    variant="danger"
                    className="border-0"
                    style={{
                      background: "linear-gradient(135deg, #fee2e2, #fecaca)",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <MdError size={16} className="text-danger me-2" />
                      <span className="fw-medium small">
                        Vui lòng liên hệ quản trị viên để gia hạn hoặc tạo hợp đồng mới.
                      </span>
                    </div>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // Contract ready to sign
  if (contractToSign) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: "linear-gradient(135deg, #fef3e2 0%, #fef9c3 50%, #fef3e2 100%)",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} xl={5}>
              <Card
                className="border-0 shadow"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ffffff 0%, #fefbf3 100%)",
                }}
              >
                <CardHeader className="text-center border-0 pt-4 pb-2" style={{ background: "transparent" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #f59e0b, #d97706)",
                      borderRadius: "50%",
                      boxShadow: "0 10px 20px rgba(245, 158, 11, 0.3)",
                    }}
                  >
                    <div
                      className="position-absolute"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(245, 158, 11, 0.2)",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    ></div>
                    <MdDescription size={30} className="text-white position-relative" />
                  </div>
                  <CardTitle className="fs-4 fw-bold text-warning mb-2">Hợp đồng sẵn sàng ký!</CardTitle>
                  <CardSubtitle className="fs-6 text-muted">
                    Hợp đồng dịch vụ của bạn đã được chuẩn bị
                  </CardSubtitle>
                </CardHeader>

                <CardBody className="px-4 py-3">
                  <Alert
                    variant="warning"
                    className="border-0 mb-3"
                    style={{
                      background: "linear-gradient(135deg, #fef3e2, #fef9c3)",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <MdError size={16} className="text-warning me-2" />
                      <span className="fw-medium small">Vui lòng xem xét kỹ các điều khoản</span>
                    </div>
                  </Alert>

                  <div className="text-center">
                    <Button
                      size="sm"
                      className="px-4 py-2 border-0 fw-bold"
                      style={{
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        borderRadius: "10px",
                        boxShadow: "0 6px 15px rgba(245, 158, 11, 0.4)",
                        transition: "all 0.3s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = "translateY(-2px)"
                        e.target.style.boxShadow = "0 8px 20px rgba(245, 158, 11, 0.5)"
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = "translateY(0)"
                        e.target.style.boxShadow = "0 6px 15px rgba(245, 158, 11, 0.4)"
                      }}
                    >
                      <a
                        href={contractToSign.signingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white text-decoration-none d-flex align-items-center"
                      >
                        <span className="me-2">Xem và ký hợp đồng</span>
                        <MdOpenInNew size={16} />
                      </a>
                    </Button>
                  </div>
                </CardBody>

                <CardFooter className="text-center border-0 pb-4" style={{ background: "transparent" }}>
                  <Badge
                    className="px-3 py-1 fs-6"
                    style={{
                      background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                      borderRadius: "20px",
                      color: "white",
                    }}
                  >
                    <MdAccessTime size={14} className="me-1" />
                    Đang chờ chữ ký
                  </Badge>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // Signed contract
  if (latestSignedContract) {
    const duration = calculateDuration(latestSignedContract.effectiveDate, latestSignedContract.expirationDate)

    return (
      <div>
        <Container>
          <Row className="justify-content-center">
            <Col lg={12} xl={6}>
              <Card
                className="border-0 shadow"
              >
                <CardHeader className="text-center border-0 pt-4 pb-2" style={{ background: "transparent" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #10b981, #059669)",
                      borderRadius: "50%",
                      boxShadow: "0 10px 20px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <div
                      className="position-absolute"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(16, 185, 129, 0.2)",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    ></div>
                    <MdCheckCircle size={30} className="text-white position-relative" />
                  </div>
                  <CardTitle className="fs-4 fw-bold text-success mb-2">Hợp đồng đã được ký!</CardTitle>
                </CardHeader>

                <CardBody className="px-4 py-3">
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Card
                        className="border-0 h-100"
                        style={{
                          background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)"
                          e.currentTarget.style.boxShadow = "0 10px 20px rgba(59, 130, 246, 0.2)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        <CardBody className="p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: "36px",
                                height: "36px",
                                background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                                borderRadius: "10px",
                              }}
                            >
                              <MdDescription size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="fw-bold text-primary small">Mã hợp đồng</p>
                              <p className="font-monospace text-primary mb-0">
                                #{latestSignedContract.contractCode}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>

                    <Col md={6}>
                      <Card
                        className="border-0 h-100"
                        style={{
                          background: "linear-gradient(135deg, #e9d5ff, #d8b4fe)",
                          borderRadius: "12px",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-3px)"
                          e.currentTarget.style.boxShadow = "0 10px 20px rgba(147, 51, 234, 0.2)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)"
                          e.currentTarget.style.boxShadow = "none"
                        }}
                      >
                        <CardBody className="p-3">
                          <div className="d-flex align-items-center mb-2">
                            <div
                              className="d-flex align-items-center justify-content-center me-2"
                              style={{
                                width: "36px",
                                height: "36px",
                                background: "linear-gradient(135deg, #9333ea, #7c3aed)",
                                borderRadius: "10px",
                              }}
                            >
                              <MdCalendarToday size={18} className="text-white" />
                            </div>
                            <div>
                              <p className="fw-bold text-purple mb-1 small" style={{ color: "#7c3aed" }}>
                                Ngày ký
                              </p>
                              <p className="h6 mb-0" style={{ color: "#7c3aed" }}>
                                {new Date(latestSignedContract.signedAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    </Col>
                  </Row>

                  <Card
                    className="border-0 mb-3"
                    style={{
                      background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
                      borderRadius: "12px",
                    }}
                  >
                    <CardBody className="p-3">
                      <div className="d-flex align-items-center mb-3">
                        <div
                          className="d-flex align-items-center justify-content-center me-2"
                          style={{
                            width: "32px",
                            height: "32px",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            borderRadius: "8px",
                          }}
                        >
                          <MdShield size={16} className="text-white" />
                        </div>
                        <h6 className="fw-bold text-success mb-0">Thông tin hiệu lực</h6>
                      </div>

                      <div className="row g-2">
                        <div className="col-12">
                          <div
                            className="p-3 border-0"
                            style={{
                              borderRadius: "10px",
                              border: "1px solid #10b981",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <MdTimer size={18} className="text-success me-2" />
                                <div>
                                  <p className="fw-bold text-success mb-1 small">Thời gian hiệu lực</p>
                                  <p className="text-success small">
                                    Từ {new Date(latestSignedContract.effectiveDate).toLocaleDateString("vi-VN")} -{" "}
                                    {new Date(latestSignedContract.expirationDate).toLocaleDateString("vi-VN")}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="col-12">
                          <div
                            className="p-3"
                            style={{
                              background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                              borderRadius: "10px",
                              border: "1px solid #3b82f6",
                            }}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <MdAccessTime size={18} className="text-primary me-2" />
                                <div>
                                  <p className="fw-bold text-primary mb-1 small">Thời hạn hợp đồng</p>
                                  <p className="text-primary mb-0 small">Tổng thời gian có hiệu lực</p>
                                </div>
                              </div>
                              <div className="text-end">
                                <p className="fs-5 fw-bold text-primary mb-0">{duration.split(" ")[0]}</p>
                                <p className="text-primary mb-0 small">{duration.split(" ").slice(1).join(" ")}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // Approved technician waiting for contract
  if (currentTechnician.status === "APPROVED" && !contractToSign && !latestSignedContract) {
    return (
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center p-3"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={6} xl={5}>
              <Card
                className="border-0 shadow"
                style={{
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                }}
              >
                <CardHeader className="text-center border-0 pt-4 pb-2" style={{ background: "transparent" }}>
                  <div
                    className="d-inline-flex align-items-center justify-content-center mb-3 position-relative"
                    style={{
                      width: "80px",
                      height: "80px",
                      background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
                      borderRadius: "50%",
                      boxShadow: "0 10px 20px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    <div
                      className="position-absolute"
                      style={{
                        width: "100px",
                        height: "100px",
                        background: "rgba(59, 130, 246, 0.2)",
                        borderRadius: "50%",
                        animation: "pulse 2s infinite",
                      }}
                    ></div>
                    <MdPerson size={30} className="text-white position-relative" />
                  </div>
                  <CardTitle className="fs-4 fw-bold text-primary mb-2">Hồ sơ đã được duyệt!</CardTitle>
                  <CardSubtitle className="fs-6 text-muted">Hợp đồng đang được chuẩn bị</CardSubtitle>
                </CardHeader>

                <CardBody className="px-4 py-3">
                  <Alert
                    variant="primary"
                    className="border-0"
                    style={{
                      background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                      borderRadius: "10px",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <MdAccessTime size={16} className="text-primary me-2" />
                      <span className="fw-medium small">
                        Hợp đồng đang được chuẩn bị. Chúng tôi sẽ thông báo khi sẵn sàng.
                      </span>
                    </div>
                  </Alert>
                </CardBody>

                <CardFooter className="text-center border-0 pb-4" style={{ background: "transparent" }}>
                  <Badge
                    className="px-3 py-1 fs-6"
                    style={{
                      background: "linear-gradient(135deg, #60a5fa, #3b82f6)",
                      borderRadius: "20px",
                      color: "white",
                    }}
                  >
                    <MdAccessTime size={14} className="me-1" />
                    Đang chuẩn bị hợp đồng
                  </Badge>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    )
  }

  // Waiting for approval
  return (
    <div className="position-fixed top-0 end-0 p-2" style={{ zIndex: 50, maxWidth: "300px" }}>
      <Alert
        variant="warning"
        className="shadow border-0"
        style={{
          background: "linear-gradient(135deg, #fef3e2, #fef9c3)",
          borderRadius: "10px",
          animation: "slideInRight 0.5s ease-out",
        }}
      >
        <div className="d-flex align-items-center">
          <MdError size={16} className="text-warning me-2" />
          <span className="fw-medium text-warning small">Hồ sơ đang chờ duyệt.</span>
        </div>
      </Alert>
    </div>
  )
}

export default ContractStatus