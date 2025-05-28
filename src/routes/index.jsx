import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/HomePage';
// import LoginPage from '../pages/LoginPage';
// import DashboardPage from '../pages/DashboardPage';

import Roles from '../constants/roles';

export default function AppRoutes() {
    return (
        <>
            <Routes>
                {/* <Route path="/login" element={<LoginPage />} /> */}
                <Route path="/" element={<HomePage />} />

                {/* <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute allowedRoles={[Roles.ADMIN, Roles.TECHNICIAN]}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                /> */}

                {/* Route mặc định chuyển hướng */}
                {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
            </Routes>
        </>
    );
}
