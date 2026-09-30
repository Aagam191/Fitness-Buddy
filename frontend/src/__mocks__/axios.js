// Jest mock for axios in CRA test environment
const mockAxiosInstance = {
  get: jest.fn(() => Promise.resolve({ data: {} })),
  post: jest.fn(() => Promise.resolve({ data: {} })),
  put: jest.fn(() => Promise.resolve({ data: {} })),
  delete: jest.fn(() => Promise.resolve({ data: {} })),
  interceptors: {
    request: { use: jest.fn(), eject: jest.fn() },
    response: { use: jest.fn(), eject: jest.fn() },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
};

const axios = {
  ...mockAxiosInstance,
  create: jest.fn(() => mockAxiosInstance),
};

export default axios;
