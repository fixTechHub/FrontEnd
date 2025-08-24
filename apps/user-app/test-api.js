// Quick API test để debug backend response
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',
  withCredentials: true,
});

async function testFeedbackAPI() {
  try {
    console.log('🧪 Testing /feedbacks/ endpoint...');
    
    const response = await apiClient.get('/feedbacks/', {
      params: {
        isVisible: true,
        ratingMin: 4
      }
    });
    
    console.log('✅ Response status:', response.status);
    console.log('✅ Response headers:', response.headers);
    console.log('✅ Response data:', JSON.stringify(response.data, null, 2));
    
    const feedbacks = response.data?.data || [];
    console.log('📊 Feedbacks count:', feedbacks.length);
    
    if (feedbacks.length > 0) {
      console.log('📋 First feedback:', JSON.stringify(feedbacks[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ API Test failed:', error.message);
    console.error('❌ Response status:', error.response?.status);
    console.error('❌ Response data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testFeedbackAPI();
