import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserCouponsThunk } from '../../features/coupons/couponSlice';
import { Badge, Form, Button, Spinner } from 'react-bootstrap';
import { formatDate } from '../../utils/formatDate';

const UserCoupons = ()=>{
  const dispatch = useDispatch();
  const { list:coupons, loading, error } = useSelector(state=>state.coupons);

  const [search,setSearch]=useState('');
  const [typeFilter,setTypeFilter]=useState('ALL');
  const [statusFilter]=useState('ALL');
  const[page,setPage]=useState(0);
  const limit=6;

  useEffect(()=>{ dispatch(fetchUserCouponsThunk());},[dispatch]);

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
    <div className="content py-4">
      <div className="container-xl">
        <h4 className="fw-semibold mb-3">Phiếu giảm giá của tôi</h4>
        {/* filter bar */}
        <Form className="d-flex flex-wrap gap-3 align-items-end p-3 shadow-sm bg-light rounded-3 mb-4">
          <Form.Group style={{minWidth:'180px'}}>
            <Form.Label>Loại</Form.Label>
            <Form.Select size="sm" value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}>
              <option value="ALL">Tất cả</option>
              <option value="PERCENT">Phần trăm</option>
              <option value="AMOUNT">Tiền</option>
            </Form.Select>
          </Form.Group>
          {/* status filter removed */}
          <Form.Group className="flex-grow-1" style={{minWidth:'220px'}}>
            <Form.Label>Tìm mã</Form.Label>
            <Form.Control size="sm" placeholder="Nhập mã..." value={search} onChange={e=>setSearch(e.target.value)} />
          </Form.Group>
          <Button variant="outline-secondary" size="sm" className="mt-4" onClick={()=>{setSearch('');setTypeFilter('ALL');}}>Xoá lọc</Button>
        </Form>

        {loading && <div className="text-center py-5"><Spinner animation="border"/></div>}
        {!!error && <p className="text-danger fw-semibold">{error}</p>}

        {!loading && filtered.length===0 && <p className="text-muted fw-semibold">Không có phiếu giảm giá phù hợp.</p>}

        <div className="row">
          {paginated.map(c=> (
            <div className="col-md-6" key={c._id}>
              <div className="p-3 mb-3 position-relative coupon-card-hover border rounded shadow-sm" style={{borderColor:cardBorder(c),background:'#fff'}}>
              <span className={`badge ${badgeClass(c)} position-absolute top-0 end-0 mt-2 me-2`} style={{color:'#fff'}}>{valLabel(c)}</span>
              <h5 className="fw-semibold text-dark mb-1">{c.code}</h5>
              {c.description && <p className="mb-2" style={{color:'#475569'}}>{c.description}</p>}
              <ul className="list-unstyled mb-0 small" style={{color:'#1e293b'}}>
                <li>Giá trị: <strong>{valLabel(c)}</strong></li>
                {c.maxDiscount && <li>Giảm tối đa: <strong>{c.maxDiscount.toLocaleString('vi-VN')}₫</strong></li>}
                {c.minOrderValue>0 && <li>Đơn tối thiểu: <strong>{c.minOrderValue.toLocaleString('vi-VN')}₫</strong></li>}
                <li>HSD: {formatDate(c.endDate)}</li>
              </ul>
            </div>
          </div>
          ))}
        </div>

        {/* pagination */}
        {filtered.length>limit && (
          <div className="d-flex justify-content-center mt-3 gap-2">
            <Button size="sm" variant="outline-secondary" disabled={page===0} onClick={()=>setPage(p=>p-1)}>Trước</Button>
            <span className="align-self-center">{page+1}/{Math.ceil(filtered.length/limit)}</span>
            <Button size="sm" variant="outline-secondary" disabled={(page+1)*limit>=filtered.length} onClick={()=>setPage(p=>p+1)}>Sau</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserCoupons;
