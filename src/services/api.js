import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const detectBoundaries = async (base64Image) => {
  try {
    const response = await axios.post(`${API_URL}/detect-boundary`, {
      image: base64Image
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: error.response?.data?.error || "Failed to communicate with server"
    };
  }
};

export const fetchPolygons = async () => {
  try {
    const response = await axios.get(`${API_URL}/polygons`);
    return response.data;
  } catch (error) {
    console.error("API Error fetching polygons:", error);
    return [];
  }
};

export const savePolygon = async (polygonData) => {
  try {
    const response = await axios.post(`${API_URL}/polygons`, polygonData);
    return response.data;
  } catch (error) {
    console.error("API Error saving polygon:", error);
    throw error;
  }
};

export const updatePolygon = async (id, polygonData) => {
  try {
    const response = await axios.put(`${API_URL}/polygons/${id}`, polygonData);
    return response.data;
  } catch (error) {
    console.error("API Error updating polygon:", error);
    throw error;
  }
};

export const deletePolygon = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/polygons/${id}`);
    return response.data;
  } catch (error) {
    console.error("API Error deleting polygon:", error);
    throw error;
  }
};

// Analytics Contracts
export const fetchNDVI = async (polygonData) => {
  const response = await axios.post(`${API_URL}/analytics/ndvi`, polygonData);
  return response.data;
};

export const fetchSAVI = async (polygonData) => {
  const response = await axios.post(`${API_URL}/analytics/savi`, polygonData);
  return response.data;
};

export const fetchNDMI = async (polygonData) => {
  const response = await axios.post(`${API_URL}/analytics/ndmi`, polygonData);
  return response.data;
};

// SOC Contract
export const predictSOC = async (payload) => {
  const response = await axios.post(`${API_URL}/soc/predict`, payload);
  return response.data;
};

// SHAP Contract
export const fetchSHAPExplanation = async (payload) => {
  const response = await axios.post(`${API_URL}/shap/explain`, payload);
  return response.data;
};

// Carbon Contract
export const calculateCarbon = async (payload) => {
  const response = await axios.post(`${API_URL}/carbon/calculate`, payload);
  return response.data;
};
