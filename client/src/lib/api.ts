import { Link } from "@/types";
import axios from "axios";

const baseUrl = "http://localhost:3020";
console.log("Allowed Origin:", baseUrl);
const getToken = () => localStorage.getItem("token");

const getAuthHeaders = () => {
  const token = getToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const login = async (userName: string, password: string) => {
  const response = await axios.post(`${baseUrl}/auth/login`, {
    password,
    userName,
  });
  return response.data;
};

export const register = async (
  name: string,
  userName: string,
  password: string
) => {
  const response = await axios.post(`${baseUrl}/auth/register`, {
    name,
    password,
    userName,
  });
  return response.data;
};

export const createShortUrl = async (orgLink: string) => {
  const response = await axios.post(
    `${baseUrl}/link`,
    { orgLink },
    { ...getAuthHeaders() }
  );
  return response.data;
};

export const createPublicShortUrl = async (orgLink: string) => {
  const response = await axios.post(`${baseUrl}/link/public`, { orgLink });
  return response.data;
};

export const markLinkClick = async (id: string) => {
  const response = await axios.patch(
    `${baseUrl}/link`,
    { id },
    { ...getAuthHeaders() }
  );
  return response.data;
};

export const deleteLink = async (id: string) => {
  const response = await axios.delete(`${baseUrl}/link/${id}`, {
    ...getAuthHeaders(),
  });
  return response.data;
};

export const getUserLinks = async (): Promise<Link[]> => {
  const response = await axios.get(`${baseUrl}/link`, { ...getAuthHeaders() });
  return response.data;
};

export const markPublicLinkClick = async (id: string) => {
  const response = await axios.patch(`${baseUrl}/link/public`, { id });
  return response.data;
};

// Export getToken
export { getToken };
