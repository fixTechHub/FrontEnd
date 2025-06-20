import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchTechnicianAvailability, changeTechnicianAvailability } from '../../features/technicians/technicianSlice';
import { Form, Spinner } from 'react-bootstrap';

const TechnicianStatus = ({ technicianId }) => {
  const dispatch = useDispatch();
  const { availability, loading, error } = useSelector((state) => state.technician);

  useEffect(() => {
    dispatch(fetchTechnicianAvailability(technicianId));
  }, [dispatch, technicianId]);

  const isBusy = availability === 'BUSY';
  const isOnJob = availability === 'ONJOB';
  const isFree = availability === 'FREE';

  const handleToggle = () => {
    if (isOnJob) return;
    dispatch(
      changeTechnicianAvailability({
        technicianId,
        status: isBusy ? 'FREE' : 'BUSY',
      })
    );
  };

  // Chọn label và màu
  let label = '';
  let color = '';
  if (isOnJob) {
    label = 'ON JOB';
    color = 'orange';
  } else if (isBusy) {
    label = 'BUSY';
    color = 'red';
  } else {
    label = 'FREE';
    color = 'green';
  }

  return (
      <div >
        <div >
      

      <Form.Check
        type="switch"
        id="technician-status-switch"
        label={<span style={{ color }}>{label}</span>}
        checked={isBusy}
        onChange={handleToggle}
        disabled={isOnJob}
        className="form-switch"
         style={{ transform: "scale(1.3)" }}
      />

      {loading && (
        <div className="mt-2">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading status...
        </div>
      )}

      {error && <p className="mt-2 text-danger">Error: {error}</p>}

      
    </div>
      </div>
    
  );
};

export default TechnicianStatus;

// import { useDispatch, useSelector } from 'react-redux';
// import { useEffect } from 'react';
// import { fetchTechnicianAvailability, changeTechnicianAvailability  } from '../../features/technicians/technicianSlice';

// const TechnicianStatus = ({ technicianId }) => {
//   const dispatch = useDispatch();
//   const { availability, loading, error } = useSelector((state) => state.technician);

//   useEffect(() => {
//     dispatch(fetchTechnicianAvailability(technicianId));
//   }, [dispatch, technicianId]);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'FREE': return '#28a745'; // green
//       case 'ONJOB': return '#fd7e14'; // orange
//       case 'BUSY': return '#dc3545'; // red
//       default: return '#6c757d'; // gray
//     }
//   };

//   const statusList = ['FREE', 'ONJOB', 'BUSY'];

//   const handleChangeStatus = (status) => {
//     if (status !== availability) {
//       dispatch(changeTechnicianAvailability({ technicianId, status }));
//     }
//   };

//    return (
//     <div style={{ marginTop: '20px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
//       <strong>Technician Status:</strong>
//       <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
//         {statusList.map((status) => (
//           <button
//             key={status}
//             onClick={() => handleChangeStatus(status)}
//             style={{
//               padding: '8px 16px',
//               borderRadius: '5px',
//               border: 'none',
//               cursor: availability === status ? 'default' : 'pointer',
//               backgroundColor: getStatusColor(status),
//               color: '#fff',
//               opacity: availability === status ? 1 : 0.6,
//             }}
//             disabled={availability === status}
//           >
//             {status}
//           </button>
//         ))}
//       </div>
//       {loading && <p style={{ marginTop: '10px' }}>Loading...</p>}
//       {error && <p style={{ marginTop: '10px', color: 'red' }}>Error: {error}</p>}
//     </div>
//   );
// };

// export default TechnicianStatus;
