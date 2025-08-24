import apiClient from '../../services/apiClient';

// Lấy danh sách lịch trình trùng
export const getConflictingSchedulesAPI = async (technicianId, startTime, endTime) => {
    try {
        console.log('🔍 DEBUG: API call getConflictingSchedulesAPI');
        console.log('  technicianId:', technicianId);
        console.log('  startTime:', startTime);
        console.log('  endTime:', endTime);

        const response = await apiClient.get(
            `/technician-schedules/conflicts?technicianId=${technicianId}&startTime=${startTime}&endTime=${endTime}`
        );

        console.log('✅ DEBUG: API response:', response.data);
        return response.data;
    } catch (error) {
        console.error('❌ DEBUG: API error:', error);
        throw error;
    }
};
