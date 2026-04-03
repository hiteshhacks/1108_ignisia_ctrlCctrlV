import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const extractReport = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/extract', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const analyzePatient = (patientName: string) => {
  return api.post('/reason-medical', { patient_name: patientName });
};

export const getChartData = (patientName: string) => {
  return api.get(`/patient/${patientName}/chart-data`);
};

export default api;
