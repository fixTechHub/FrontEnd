import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { customerSteps, technicianSteps,customerWarrantySteps,technicianWarrantySteps } from '../utils/stepsData';

export const useBookingParams = () => {
    const [bookingId, setBookingId] = useState(null);
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state) => state.auth);
    const stepsForCurrentUser = user?.role?.name === 'CUSTOMER' ? customerSteps : technicianSteps;

    useEffect(() => {
        const id = searchParams.get('bookingId');
        setBookingId(id);
    }, [searchParams]);

    return {
        bookingId,
        user,
        stepsForCurrentUser,
        searchParams
    };
};

export const useBookingWarrantyParams = () => {
    const [bookingWarrantyId, setBookingWarrantyId] = useState(null);
    const [searchParams] = useSearchParams();
    const { user } = useSelector((state) => state.auth);
    const stepsForCurrentUser = user?.role?.name === 'CUSTOMER' ? customerWarrantySteps : technicianWarrantySteps;
    useEffect(() => {
        const id = searchParams.get('bookingWarrantyId');
        setBookingWarrantyId(id);
    }, [searchParams]);

    return {
        bookingWarrantyId,
        user,
        stepsForCurrentUser,
        searchParams
    };
};