import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Dropdown } from 'react-bootstrap';
import { fetchReceipts, selectReceipts, selectReceiptStatus } from './receiptSlice';
import jsPDF from 'jspdf';
import 'bootstrap/dist/css/bootstrap.min.css';
import './PaymentsDashboard.css';


const ReceiptPage = () => {
  const dispatch = useDispatch();
  const receipts = useSelector(selectReceipts);
  const status = useSelector(selectReceiptStatus);
  const [showModal, setShowModal] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState(null);
  const pdfRef = useRef();

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  const handleShowModal = (receipt) => {
    setSelectedReceipt(receipt);
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  const handlePrintPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Invoice', 20, 20);
    doc.setFontSize(12);
    doc.text(`Invoice Number: ${selectedReceipt?.receiptCode || 'N/A'}`, 20, 40);
    doc.text(`Issue Date: ${new Date(selectedReceipt?.issuedDate).toLocaleDateString()}`, 20, 50);
    doc.text(`Billed to: Customer Name`, 20, 70);
    doc.text(`Car: ${selectedReceipt?.bookingId?.serviceId?.name || 'N/A'}`, 20, 90);
    doc.text(`Total Amount: $${selectedReceipt?.totalAmount || 0}`, 20, 100);
    doc.text(`Payment Method: ${selectedReceipt?.paymentMethod || 'N/A'}`, 20, 110);
    doc.save(`invoice_${selectedReceipt?.receiptCode}.pdf`);
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <div className="content">
      <div className="container">
        <div className="content-header">
          <h4>Payments</h4>
        </div>

        <div className="row">
          <div className="col-lg-12">
            <div className="sorting-info">
              <div className="row d-flex align-items-center">
                <div className="col-lg-12">
                  <div className="filter-group">
                    <Dropdown className="sort-week sort">
                      <Dropdown.Toggle variant="light">
                        This Week <i className="fas fa-chevron-down"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>This Week</Dropdown.Item>
                        <Dropdown.Item>This Month</Dropdown.Item>
                        <Dropdown.Item>Last 30 Days</Dropdown.Item>
                        <Dropdown.Item>Custom</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                    <Dropdown className="sort-relevance sort">
                      <Dropdown.Toggle variant="light">
                        Sort By Relevance <i className="fas fa-chevron-down"></i>
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item>Sort By Relevance</Dropdown.Item>
                        <Dropdown.Item>Sort By Ascending</Dropdown.Item>
                        <Dropdown.Item>Sort By Descending</Dropdown.Item>
                        <Dropdown.Item>Sort By Alphabet</Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-12 d-flex">
            <div className="card book-card flex-fill mb-0">
              <div className="card-header">
                <div className="row align-items-center">
                  <div className="col-md-5">
                    <h4>All Payments <span>{receipts.length}</span></h4>
                  </div>
                  <div className="col-md-7 text-md-end">
                    <div className="table-search">
                      <input type="text" placeholder="Search..." />
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive dashboard-table">
                  <table className="table datatable">
                    <thead className="thead-light">
                      <tr>
                        <th>
                          <label className="custom_check w-100">
                            <input type="checkbox" name="username" />
                            <span className="checkmark"></span>
                          </label>
                        </th>
                        <th>Booking ID</th>
                        <th>Car Name</th>
                        <th>Paid on</th>
                        <th>Total</th>
                        <th>Mode</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipts.map((receipt) => (
                        <tr key={receipt._id}>
                          <td>
                            <label className="custom_check w-100">
                              <input type="checkbox" name="reference" />
                              <span className="checkmark"></span>
                            </label>
                          </td>
                          <td>
                            <a href="#" onClick={() => handleShowModal(receipt)}>
                              {receipt.receiptCode}
                            </a>
                          </td>
                          <td>
                            <div className="table-avatar">
                              <a href="#" className="avatar avatar-lg flex-shrink-0">
                                <img
                                  className="avatar-img"
                                  src={receipt.bookingId?.serviceId?.image || 'assets/img/cars/car-04.jpg'}
                                  alt="Booking"
                                />
                              </a>
                              <div className="table-head-name flex-grow-1">
                                <a href="#">{receipt.bookingId?.serviceId?.name || 'N/A'}</a>
                                <p>{receipt.bookingId?.isUrgent ? 'Delivery' : 'Self Pickup'}</p>
                              </div>
                            </div>
                          </td>
                          <td>{formatDate(receipt.issuedDate)}</td>
                          <td><p className="text-darker">${receipt.totalAmount}</p></td>
                          <td>
                            <span className="badge badge-light-secondary">{receipt.paymentMethod}</span>
                          </td>
                          <td>
                            <span className={`badge badge-light-${receipt.paymentStatus.toLowerCase()}`}>
                              {receipt.paymentStatus}
                            </span>
                          </td>
                          <td className="text-end">
                            <Dropdown>
                              <Dropdown.Toggle variant="light">
                                <i className="fas fa-ellipsis-vertical"></i>
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                <Dropdown.Item onClick={() => handleShowModal(receipt)}>
                                  <i className="feather-file-plus"></i> View Invoice
                                </Dropdown.Item>
                                <Dropdown.Item>
                                  <i className="feather-trash-2"></i> Delete
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="table-footer">
                  <div className="row">
                    <div className="col-md-6">
                      <div id="tablelength"></div>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <div id="tablepage"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          size="xl"
          backdrop="static"
          keyboard={false}
        >
          <Modal.Header className="border-0 m-0 p-0">
            <div className="invoice-btns">
              <Button variant="light" className="me-2" onClick={handlePrintPDF}>
                <i className="feather-printer"></i> Print
              </Button>
              <Button variant="light" onClick={handlePrintPDF}>
                <i className="feather-download"></i> Download Invoice
              </Button>
            </div>
          </Modal.Header>
          <Modal.Body>
            <div className="invoice-details" ref={pdfRef}>
              <div className="invoice-items">
                <div className="row align-items-center">
                  <div className="col-md-6">
                    <div className="invoice-logo">
                      <img src="assets/img/logo.svg" alt="logo" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="invoice-info-text">
                      <h4>Invoice</h4>
                      <p>Invoice Number: <span>{selectedReceipt?.receiptCode}</span></p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-item-bills">
                <div className="row align-items-center">
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info">
                      <h6>Billed to</h6>
                      <p>
                        Customer Name <br />
                        9087484288 <br />
                        Address line 1, <br />
                        Address line 2 <br />
                        Zip code, City - Country
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info">
                      <h6>Invoice From</h6>
                      <p>
                        Company Name <br />
                        9087484288 <br />
                        Address line 1, <br />
                        Address line 2 <br />
                        Zip code, City - Country
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-4 col-md-12">
                    <div className="invoice-bill-info border-0">
                      <p>Issue Date: {formatDate(selectedReceipt?.issuedDate)}</p>
                      <p>Due Amount: ${selectedReceipt?.totalAmount}</p>
                      <p className="mb-0">PO Number: 54515454</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-table-wrap">
                <div className="row">
                  <div className="col-md-12">
                    <div className="table-responsive">
                      <table className="invoice-table table table-center mb-0">
                        <thead>
                          <tr>
                            <th>Rented Car</th>
                            <th>No of days</th>
                            <th>Rental Amount</th>
                            <th className="text-end">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>
                              <h6>{selectedReceipt?.bookingId?.serviceId?.name || 'N/A'}</h6>
                            </td>
                            <td>7</td>
                            <td>${selectedReceipt?.serviceAmount}</td>
                            <td className="text-end">${selectedReceipt?.totalAmount}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="payment-details-info">
                <div className="row">
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-terms">
                      <h6>Payment Details</h6>
                      <div className="invocie-note">
                        <p>
                          {selectedReceipt?.paymentMethod} <br />
                          XXXXXXXXXXXX-2541 <br />
                          HDFC Bank
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-total-box">
                      <div className="invoice-total-inner">
                        <p><b>Trip Amount</b> <span>${selectedReceipt?.serviceAmount}</span></p>
                        <p>Trip Protection Fees <span>+ $25</span></p>
                        <p>Convenience Fees <span>+ $2</span></p>
                        <p>Refundable Deposit <span>+ ${selectedReceipt?.holdingAmount || 0}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="invoice-total">
                <h4>Total <span>${selectedReceipt?.totalAmount}</span></h4>
              </div>
              <div className="invoice-note-footer">
                <div className="row align-items-center">
                  <div className="col-lg-6 col-md-12">
                    <div className="invocie-note">
                      <h6>Notes</h6>
                      <p>Enter customer notes or any other details</p>
                    </div>
                    <div className="invocie-note mb-0">
                      <h6>Terms and Conditions</h6>
                      <p>Enter customer notes or any other details</p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="invoice-sign">
                      <img className="img-fluid d-inline-block" src="assets/img/signature.png" alt="Sign" />
                      <span className="d-block">dreamsrent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    </div>
  );
};

export default ReceiptPage;