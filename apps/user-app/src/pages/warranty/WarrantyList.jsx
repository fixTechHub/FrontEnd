import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../../services/apiClient';
import { Table, Badge, Spinner, Alert, Form, Button } from 'react-bootstrap';
import { formatDateOnly, formatTimeOnly } from '../../utils/formatDate';

const statusColorMap={
  PENDING:'warning',
  CONFIRMED:'info',
  IN_PROGRESS:'primary',
  RESOLVED:'success',
  DENIED:'danger',
  DONE:'success'
};

const statusLabel=(s)=>{
  switch(s){
    case 'PENDING':return 'Đang chờ';
    case 'CONFIRMED':return 'Đã xác nhận';
    case 'IN_PROGRESS':return 'Đang xử lý';
    case 'RESOLVED':return 'Đã xử lý';
    case 'DENIED':return 'Từ chối';
    case 'DONE':return 'Hoàn tất';
    default:return s;
  }
};

const WarrantyList=()=>{
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[list,setList]=useState([]);

  // filters
  const[statusFilter]=useState('ALL');
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
    <div className="content py-4">
      <div className="container-xl">
        <h4 className="mb-4 fw-semibold">Yêu cầu bảo hành của tôi</h4>
        {loading && <div className="text-center py-4"><Spinner animation="border"/></div>}
        {error && <Alert variant="danger">{error}</Alert>}
        {!loading && !error && (
          <>
          {/* Filters */}
          <Form className="d-flex flex-wrap gap-3 align-items-end mb-4 p-3 shadow-sm bg-light rounded-3" style={{overflowX:'auto'}}>
            <Form.Group style={{minWidth:'180px'}}>
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
                <option value="ALL">Tất cả</option>
                {Object.keys(statusColorMap).map(s=>(<option key={s} value={s}>{statusLabel(s)}</option>))}
              </Form.Select>
            </Form.Group>
            <Form.Group style={{minWidth:'160px'}}>
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
            </Form.Group>
            <Form.Group style={{minWidth:'160px'}}>
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
            </Form.Group>
            <Form.Group className="d-flex gap-2" style={{minWidth:'120px'}}>
              <Button variant="outline-secondary" className="mt-4" onClick={()=>{setStatusFilter('ALL');setFromDate('');setToDate('');setSearch('');}}>Xoá lọc</Button>
            </Form.Group>
            <Form.Group className="flex-grow-1" style={{minWidth:'220px'}}>
              <Form.Label>Tìm kiếm</Form.Label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0"><i className="fa fa-search" style={{color:'#64748b'}}></i></span>
                <Form.Control className="border-start-0" placeholder="Mã bảo hành / Mã đặt" value={search} onChange={e=>setSearch(e.target.value)} />
              </div>
            </Form.Group>
          </Form>

          <Table responsive hover bordered className="shadow-sm">
            <thead className="table-light">
              <tr>
                <th>Mã</th>
                <th>Đặt lịch</th>
                <th>Ngày yêu cầu</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 && (
                <tr><td colSpan={4} className="text-center fw-semibold" style={{color:'#64748b'}}>Chưa có yêu cầu bảo hành</td></tr>
              )}
              {paginated.map(w=>(
                <tr key={w._id}>
                  <td>{w.code||w._id.slice(-6)}</td>
                  <td>{w.bookingId?.bookingCode||'N/A'}</td>
                  <td>{formatDateOnly(w.createdAt)} {formatTimeOnly(w.createdAt)}</td>
                  <td>
                    <Badge bg={statusColorMap[w.status]||'secondary'}>{statusLabel(w.status)}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

        {filtered.length>limit && (
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button size="sm" variant="outline-secondary" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Trước</Button>
            <span className="align-self-center">{page+1}/{Math.ceil(filtered.length/limit)}</span>
            <Button size="sm" variant="outline-secondary" disabled={(page+1)*limit>=filtered.length} onClick={()=>setPage(p=>p+1)}>Sau</Button>
          </div>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default WarrantyList;
