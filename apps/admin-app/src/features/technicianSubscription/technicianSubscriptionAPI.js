import ApiBE from '../../services/ApiBE';

export const technicianSubscriptionAPI = {
  // Get all subscriptions
  getAll: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription');
      return response.data;
    } catch (error) {
      console.error('Get all subscriptions error:', error);
      throw error;
    }
  },

  // Get subscription by ID
  getById: async (id) => {
    try {
      const response = await ApiBE.get(`/TechnicianSubscription/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get subscription by ID error:', error);
      throw error;
    }
  },

  // Get subscription by technician ID
  getByTechnicianId: async (technicianId) => {
    try {
      const response = await ApiBE.get(`/TechnicianSubscription/technician/${technicianId}`);
      return response.data;
    } catch (error) {
      console.error('Get subscription by technician ID error:', error);
      throw error;
    }
  },

  // Get active subscriptions
  getActiveSubscriptions: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription/active');
      return response.data;
    } catch (error) {
      console.error('Get active subscriptions error:', error);
      throw error;
    }
  },

  // Get expired subscriptions
  getExpiredSubscriptions: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription/expired');
      return response.data;
    } catch (error) {
      console.error('Get expired subscriptions error:', error);
      throw error;
    }
  },

  // Get subscriptions by package
  getByPackage: async (packageId) => {
    try {
      const response = await ApiBE.get(`/TechnicianSubscription/package/${packageId}`);
      return response.data;
    } catch (error) {
      console.error('Get subscriptions by package error:', error);
      throw error;
    }
  },

  // Get active subscriptions count
  getActiveCount: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription/stats/count');
      return response.data;
    } catch (error) {
      console.error('Get active count error:', error);
      throw error;
    }
  },

  // Get total revenue
  getTotalRevenue: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription/stats/revenue');
      return response.data;
    } catch (error) {
      console.error('Get total revenue error:', error);
      throw error;
    }
  },

  // Get monthly revenue
  getMonthlyRevenue: async (year, month) => {
    try {
      const response = await ApiBE.get(`/TechnicianSubscription/stats/revenue/monthly?year=${year}&month=${month}`);
      return response.data;
    } catch (error) {
      console.error('Get monthly revenue error:', error);
      throw error;
    }
  },

  // Get yearly revenue statistics
  getYearlyRevenue: async (year) => {
    try {
      const response = await ApiBE.get(`/TechnicianSubscription/stats/revenue/yearly/${year}`);
      return response.data;
    } catch (error) {
      console.error('Get yearly revenue error:', error);
      throw error;
    }
  },

  // Get subscriptions summary
  getSummary: async () => {
    try {
      const response = await ApiBE.get('/TechnicianSubscription/summary');
      return response.data;
    } catch (error) {
      console.error('Get summary error:', error);
      throw error;
    }
  },

  // Create new subscription
  create: async (subscriptionData) => {
    try {
      const response = await ApiBE.post('/TechnicianSubscription', subscriptionData);
      return response.data;
    } catch (error) {
      console.error('Create subscription error:', error);
      throw error;
    }
  },

  // Update subscription
  update: async (id, updateData) => {
    try {
      const response = await ApiBE.put(`/TechnicianSubscription/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update subscription error:', error);
      throw error;
    }
  },

  // Update payment status
  updatePaymentStatus: async (id, paymentStatus, transactionId = null) => {
    try {
      const response = await ApiBE.put(`/TechnicianSubscription/${id}/payment-status`, {
        paymentStatus,
        transactionId
      });
      return response.data;
    } catch (error) {
      console.error('Update payment status error:', error);
      throw error;
    }
  },

  // Cancel subscription
  cancelSubscription: async (id, reason) => {
    try {
      const response = await ApiBE.put(`/TechnicianSubscription/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error('Cancel subscription error:', error);
      throw error;
    }
  },

  // Renew subscription
  renewSubscription: async (id, newEndDate) => {
    try {
      const response = await ApiBE.put(`/TechnicianSubscription/${id}/renew`, { newEndDate });
      return response.data;
    } catch (error) {
      console.error('Renew subscription error:', error);
      throw error;
    }
  },

  // Delete subscription
  delete: async (id) => {
    try {
      const response = await ApiBE.delete(`/TechnicianSubscription/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete subscription error:', error);
      throw error;
    }
  }
};
