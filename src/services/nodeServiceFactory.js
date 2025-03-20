import mockNodeService from './mockNodeService';
import nodeService from './nodeService';

// Set this to true to use mock data, false to use real API
const USE_MOCK_DATA = false;

const nodeServiceFactory = {
  getService: () => {
    return USE_MOCK_DATA ? mockNodeService : nodeService;
  }
};

export default nodeServiceFactory; 