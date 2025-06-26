import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserReceipts } from '../../features/receipts/receiptSlice';
import ReceiptTable from './components/ReceiptTable';

const ReceiptPage = () => {
  const dispatch = useDispatch();
  const { receipts, loading, error } = useSelector((state) => state.receipt);

  useEffect(() => {
    dispatch(fetchUserReceipts());
  }, [dispatch]);

  return (
    <div className="container mt-5">
      {loading && <p>Loading...</p>}
      {error && <p className="text-danger">{error}</p>}
      {!loading && <ReceiptTable receipts={receipts} />}
    </div>
  );
};

export default ReceiptPage;
