import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import HomePage from '../pages/home/HomePage';
import LogInPage from '../pages/authentication/LogInPage';
import RegisterPage from '../pages/authentication/RegisterPage';
import ChooseRole from '../pages/authentication/ChooseRole';
import ViewTechnicianProfile from '../pages/technician/TechnicianProfile';
import CreateContractPage from '../pages/contracts/CreateContractPage';
export default function AppRoutes() {
    return (
        <>
            <Routes>
                {/* Route mặc định chuyển hướng */}
                <Route path="*" element={<Navigate to="/login" replace />} />
                
                <Route path="/" element={<HomePage />} />

                <Route path="/login" element={<LogInPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/choose-role" element={<ChooseRole />} />
                <Route path="/chat/:bookingId" element={<ChatPage />} />
                <Route path="/technician/profile/:id" element={<ViewTechnicianProfile />} />
                <Route path="/create-contract" element={<CreateContractPage />} />

                {/* <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute allowedRoles={[Roles.ADMIN, Roles.TECHNICIAN]}>
                            <DashboardPage />
                        </PrivateRoute>
                    }
                /> */}

            </Routes>
        </>
    );
}
