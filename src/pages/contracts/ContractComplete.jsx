import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useParams, Link } from 'react-router-dom';

const ContractComplete = () => {
  const { bookingId, event } = useParams();
  
  const { user,technician, isAuthenticated, loading } = useSelector((state) => state.auth);
 
  console.log(user);
  

 

  return (
    <>
    <Header />

    <div className="contract-page">
      <h1>Contract Generation</h1>


        <div>
          <p>Contract generated successfully.</p>
       
        </div>
     
    </div>
    <Footer />

    </>
  );
};

export default ContractComplete;
