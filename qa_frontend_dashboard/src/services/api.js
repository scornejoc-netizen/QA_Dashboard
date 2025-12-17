import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api'; // Asegúrate que tu Django corra aquí

export const getDevelopers = async () => {
  try {
    const response = await axios.get(`${API_URL}/developers/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching developers", error);
    return [];
  }
};

export const getDeveloperReport = async (devId, startDate = null, endDate = null) => {
  try {
    let params = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await axios.get(`${API_URL}/reports/${devId}/`, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching report", error);
    return null;
  }
};

export const getGeneralSummary = async () => {
  try {
    const response = await axios.get(`${API_URL}/summary/`);
    return response.data;
  } catch (error) {
    console.error("Error fetching summary", error);
    return [];
  }
};