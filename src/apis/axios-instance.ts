import axios, { AxiosRequestConfig } from 'axios';

const getAxiosInstance = (BASE_URL: string, options?: AxiosRequestConfig) => {
  return axios.create({
    baseURL: BASE_URL,
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
};

export default getAxiosInstance;
