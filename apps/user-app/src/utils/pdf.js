import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import { toast } from 'react-toastify';
import { formatCurrency, maskTransactionId } from './formatDuration';

// Import the provided robotoFonts object
import { robotoFonts } from './font';

// Set up the virtual file system
// Use Roboto fonts if available, fall back to Times New Roman
const vfs = robotoFonts ? { ...robotoFonts, ...pdfFonts.vfs } : pdfFonts.vfs;
pdfMake.vfs = vfs;

// Configure fonts for pdfMake
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf', // Using Medium as bold since no Roboto-Bold provided
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
  Times: {
    normal: 'Times-Roman',
    bold: 'Times-Bold',
    italics: 'Times-Italic',
    bolditalics: 'Times-BoldItalic',
  },
};

const handlePrintPDF = (selectedReceipt) => {
  try {
    // Validate selectedReceipt
    if (!selectedReceipt) {
      throw new Error('No receipt data provided');
    }

    // Define the document structure
    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [20, 20, 20, 20],
      defaultStyle: {
        font: robotoFonts ? 'Roboto' : 'Times', // Prefer Roboto, fall back to Times
        fontSize: 12,
      },
      // Header
      header: {
        columns: [
          {
            text: 'Invoice',
            color: '#ffffff',
            fontSize: 20,
            bold: true,
            alignment: 'left',
            margin: [20, 10, 0, 0],
            background: '#007bff',
          },
        ],
      },
      content: [
        // Invoice Details
        {
          columns: [
            {
              stack: [
                { text: `Mã hóa đơn: ${selectedReceipt?.receiptCode || 'N/A'}`, margin: [0, 10, 0, 5] },
                { text: `Mã đơn: ${selectedReceipt?.bookingId?.bookingCode || 'N/A'}`, margin: [0, 0, 0, 5] },
                {
                  text: `Ngày: ${selectedReceipt?.issuedDate ? new Date(selectedReceipt.issuedDate).toLocaleDateString('vi-VN') : 'N/A'}`,
                  margin: [0, 0, 0, 5],
                },
              ],
            },
          ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10] },
        // Customer and Company Details
        {
          columns: [
            {
              stack: [
                { text: 'Khách Hàng', fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
                { text: selectedReceipt?.bookingId?.customerId?.fullName || 'Customer Name', margin: [0, 0, 0, 5] },
                { text: selectedReceipt?.bookingId?.customerId?.phone || 'N/A', margin: [0, 0, 0, 5] },
              ],
            },
            {
              stack: [
                { text: 'Hệ Thống', fontSize: 14, bold: true, margin: [0, 10, 0, 5], alignment: 'right' },
                { text: 'FixTechHub', margin: [0, 0, 0, 5], alignment: 'right' },
                { text: '0814035790', margin: [0, 0, 0, 5], alignment: 'right' },
              ],
            },
          ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10] },
        // Service and Payment Details
        {
          stack: [
            { text: 'Thông tin Thanh Toán', fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            { text: `Dịch Vụ: ${selectedReceipt?.bookingId?.serviceId?.serviceName || 'N/A'}`, margin: [0, 0, 0, 5] },
            { text: `Phương Thức: ${selectedReceipt?.paymentMethod || 'N/A'}`, margin: [0, 0, 0, 5] },
            {
              text: `Mã Giao Dịch: ${selectedReceipt?.paymentGatewayTransactionId ? maskTransactionId(selectedReceipt.paymentGatewayTransactionId) : 'N/A'}`,
              margin: [0, 0, 0, 5],
            },
            { text: `Trạng Thái: ${selectedReceipt?.paymentStatus || 'N/A'}`, margin: [0, 0, 0, 5] },
          ],
        },
        // Itemized Table
        {
          stack: [
            { text: 'Chi Tiết Thanh Toán', fontSize: 14, bold: true, margin: [0, 20, 0, 10] },
            {
              table: {
                headerRows: 1,
                widths: ['*', 80, 80],
                body: [
                  [
                    { text: 'Mục', bold: true, fillColor: '#f8f9fa' },
                    { text: 'Số Lượng', bold: true, fillColor: '#f8f9fa', alignment: 'center' },
                    { text: 'Giá', bold: true, fillColor: '#f8f9fa', alignment: 'right' },
                  ],
                  [
                    'Phí Kiểm Tra',
                    '1',
                    { text: formatCurrency(selectedReceipt?.bookingId?.technicianId?.inspectionFee || 0), alignment: 'right' },
                  ],
                  ...(selectedReceipt?.bookingId?.quote?.items?.length > 0
                    ? selectedReceipt.bookingId.quote.items.map((item) => [
                        item.name,
                        item.quantity >= 1 ? `x${item.quantity}` : '1',
                        { text: formatCurrency(item.price), alignment: 'right' },
                      ])
                    : []),
                  // ['Phí Dịch Vụ', '1', { text: formatCurrency(selectedReceipt?.serviceAmount || 0), alignment: 'right' }],
                  ['Giảm', '1', { text: `-${formatCurrency(selectedReceipt?.discountAmount || 0)}`, alignment: 'right' }],
                ],
              },
            },
          ],
        },
        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 10] },
        // Total
        {
          text: `Tổng: ${formatCurrency(selectedReceipt?.totalAmount || 0)}`,
          fontSize: 14,
          bold: true,
          alignment: 'right',
          margin: [0, 10, 0, 20],
        },
        // Notes
        {
          stack: [
            { text: 'Mô Tả', fontSize: 14, bold: true, margin: [0, 0, 0, 5] },
            {
              text: selectedReceipt?.bookingId?.description || 'Enter customer notes or any other details',
              margin: [0, 0, 0, 10],
              lineHeight: 1.2,
            },
          ],
        },
        // Footer
        {
          stack: [
            { text: 'FixTechHub', fontSize: 14, bold: true, margin: [0, 20, 0, 5] },
            { text: 'Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!', fontSize: 10, color: '#666666' },
          ],
        },
      ],
      styles: {
        header: {
          fillColor: '#007bff',
          color: '#ffffff',
        },
      },
    };

    // Create and download the PDF
    pdfMake.createPdf(docDefinition).download(`invoice_${selectedReceipt?.receiptCode || 'unknown'}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error('Không thể tạo hóa đơn PDF. Vui lòng thử lại.');
  }
};

export default handlePrintPDF;