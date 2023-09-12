import { AxiosInstance } from 'axios';
import getAxiosInstance from './axios-instance';
import BASE_URL from '../constants/base-url';

class HttpClient {
  private axiosIntance: AxiosInstance;

  constructor(instance: AxiosInstance) {
    this.axiosIntance = instance;
  }

  async get(url: string) {
    try {
      const { data } = await this.axiosIntance.get(`${url}`);
      return data;
    } catch (error) {
      return error;
    }
  }
}

const http = new HttpClient(getAxiosInstance(BASE_URL));

export default http;
