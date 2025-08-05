import React, { useState } from 'react';
import { FaBell, FaUserCircle, FaDownload, FaServer } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Modal, Dropdown, Switch, Input } from 'antd';
import { ReactSortable } from 'react-sortablejs';

const AdminHeader = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  const [useDotNetBackend, setUseDotNetBackend] = useState(true);
  
  // Dữ liệu mẫu cho export - sẽ được cập nhật từ trang hiện tại
  const [exportData, setExportData] = useState([]);
  const [exportColumns, setExportColumns] = useState([]);
  const [defaultFileName, setDefaultFileName] = useState('exported_data');
  const [defaultSheetName, setDefaultSheetName] = useState('Sheet1');
  
  // columnsState: [{dataIndex, title, checked}]
  const [columnsState, setColumnsState] = useState([]);
  const [fileName, setFileName] = useState(defaultFileName);
  const [sheetName, setSheetName] = useState(defaultSheetName);

  // Cập nhật columnsState khi exportColumns thay đổi
  React.useEffect(() => {
    setColumnsState(exportColumns.map(col => ({ ...col, checked: true })));
  }, [exportColumns]);

  // Cập nhật fileName và sheetName khi default values thay đổi
  React.useEffect(() => {
    setFileName(defaultFileName);
    setSheetName(defaultSheetName);
  }, [defaultFileName, defaultSheetName]);

  const handleServerSwitch = (checked) => {
    setUseDotNetBackend(checked);
  };

  const handleExportExcel = () => {
    // Lấy dữ liệu từ trang hiện tại
    const currentPageData = getCurrentPageData();
    if (currentPageData) {
      setExportData(currentPageData.data);
      setExportColumns(currentPageData.columns);
      setDefaultFileName(currentPageData.fileName || 'exported_data');
      setDefaultSheetName(currentPageData.sheetName || 'Sheet1');
    }
    setShowExportModal(true);
  };

  // Hàm để lấy dữ liệu từ trang hiện tại
  const getCurrentPageData = () => {
    // Lấy dữ liệu từ window object của trang hiện tại
    if (window.currentPageExportData) {
      return window.currentPageExportData;
    }
    
    // Fallback data cho booking page (legacy support)
    if (window.bookingsExportData && window.bookingsExportColumns) {
      return {
        data: window.bookingsExportData,
        columns: window.bookingsExportColumns,
        fileName: window.bookingsExportFileName || 'bookings_export',
        sheetName: window.bookingsExportTitle || 'Bookings'
      };
    }
    
    // Fallback data từ table HTML
    const table = document.querySelector('table');
    if (table) {
      const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent.trim());
      const rows = Array.from(table.querySelectorAll('tbody tr')).map(row => {
        const cells = Array.from(row.querySelectorAll('td'));
        const rowData = {};
        headers.forEach((header, index) => {
          if (cells[index]) {
            rowData[header] = cells[index].textContent.trim();
          }
        });
        return rowData;
      });
      
      const columns = headers.map(header => ({
        title: header,
        dataIndex: header.toLowerCase().replace(/\s+/g, '_')
      }));
      
      return {
        data: rows,
        columns: columns,
        fileName: 'page_export',
        sheetName: 'Sheet1'
      };
    }
    
    return null;
  };

  const handleModalOk = () => {
    // Lấy cột đã chọn và đúng thứ tự
    const selectedColumns = columnsState.filter(col => col.checked);
    // Lọc dữ liệu chỉ lấy các cột đã chọn và đúng thứ tự
    const filteredData = exportData.map(row => {
      const filteredRow = {};
      selectedColumns.forEach(col => {
        filteredRow[col.dataIndex] = row[col.dataIndex];
      });
      return filteredRow;
    });
    // Tạo worksheet và workbook
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `${fileName || 'exported_data'}.xlsx`);
    setShowExportModal(false);
  };

  const handleModalCancel = () => {
    setShowExportModal(false);
  };

  // Xử lý chọn/bỏ cột
  const handleCheckColumn = (dataIndex) => {
    setColumnsState(cols => cols.map(col => col.dataIndex === dataIndex ? { ...col, checked: !col.checked } : col));
  };

  // User menu items
  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 'bold' }}>Admin User</div>
          <div style={{ fontSize: '12px', color: '#666' }}>admin@fixtech.com</div>
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            🟢 .NET Backend
          </div>
        </div>
      ),
      disabled: true
    },
    {
      type: 'divider'
    },
    {
      key: 'server',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ fontSize: '12px' }}>Backend:</span>
          <Switch
            size="small"
            checked={useDotNetBackend}
            onChange={handleServerSwitch}
            checkedChildren=".NET"
            unCheckedChildren="NodeJS"
          />
        </div>
      )
    }
  ];

  return (
    <header className="admin-header" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: 16, background: '#fff', borderBottom: '1px solid #eee' }}>
      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn" style={{ background: '#f5f5f5', border: 'none', borderRadius: 6, padding: 8 }} onClick={handleExportExcel}>
          <FaDownload /> Export
        </button>
        <FaBell className="icon" style={{ fontSize: 22, color: '#FFA726', marginLeft: 8, cursor: 'pointer' }} />
        
        {/* Server indicator */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          padding: '4px 8px', 
          borderRadius: '4px', 
          background: useDotNetBackend ? '#e6f7ff' : '#f6ffed',
          border: `1px solid ${useDotNetBackend ? '#91d5ff' : '#b7eb8f'}`
        }}>
          <FaServer style={{ fontSize: '12px', color: useDotNetBackend ? '#1890ff' : '#52c41a' }} />
          <span style={{ fontSize: '12px', color: useDotNetBackend ? '#1890ff' : '#52c41a' }}>
            {useDotNetBackend ? '.NET' : 'NodeJS'}
          </span>
        </div>
        
        <Dropdown
          menu={{ items: userMenuItems }}
          placement="bottomRight"
          trigger={['click']}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '4px 8px', borderRadius: '6px', background: '#f5f5f5' }}>
            <FaUserCircle style={{ fontSize: 20, color: '#666' }} />
            <span style={{ fontSize: '14px', color: '#333' }}>
              Admin User
            </span>
          </div>
        </Dropdown>
      </div>

      {/* Export Modal */}
      <Modal
        title="Export to Excel"
        open={showExportModal}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Export"
        cancelText="Cancel"
      >
        <div style={{ marginBottom: 12 }}>
          <b>Chọn cột và kéo thả để sắp xếp:</b>
          <ReactSortable
            list={columnsState}
            setList={setColumnsState}
            animation={200}
          >
            {columnsState.map((col, idx) => (
              <div key={col.dataIndex} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, cursor: 'grab', background: '#f7f7f7', borderRadius: 4, padding: 4 }}>
                <input
                  type="checkbox"
                  checked={col.checked}
                  onChange={() => handleCheckColumn(col.dataIndex)}
                  style={{ marginRight: 8 }}
                />
                <span style={{ flex: 1 }}>{col.title}</span>
                <span style={{ fontSize: 16, color: '#bbb', cursor: 'grab' }}>☰</span>
              </div>
            ))}
          </ReactSortable>
        </div>
        <div style={{ marginBottom: 12 }}>
          <b>Tên file:</b>
          <Input value={fileName} onChange={e => setFileName(e.target.value)} placeholder="Tên file" style={{ marginTop: 4 }} />
        </div>
        <div>
          <b>Tên sheet:</b>
          <Input value={sheetName} onChange={e => setSheetName(e.target.value)} placeholder="Tên sheet" style={{ marginTop: 4 }} />
        </div>
      </Modal>
    </header>
  );
};

export default AdminHeader; 