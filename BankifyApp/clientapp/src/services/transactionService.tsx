import { ResponseDto } from "../models/response";
import { RequestTransaction, TransactionDto } from "../models/transaction";
import api from "./api";

export const getBalance = async (accountNumber: number, pin: string): Promise<ResponseDto<TransactionDto>> => {
  const response = await api.get(`/Transaction/Balance?accountNumber=${accountNumber}&pin=${pin}`);
  return response.data;
};

export const getHistory = async (accountNumber: number): Promise<ResponseDto<TransactionDto[]>> => {
  const response = await api.get(`/Transaction/History?accountNumber=${accountNumber}`);
  return response.data;
};

export const depositMoney = async (request : RequestTransaction): Promise<ResponseDto<TransactionDto>> => {
  const response = await api.put("/Transaction/deposit", request);
  return response.data;
};

export const withdrawMoney = async (request : RequestTransaction): Promise<ResponseDto<TransactionDto>> => {
  const response = await api.put("/Transaction/withdraw", request);
  return response.data;
};

export const changePin = async (request : RequestTransaction): Promise<ResponseDto<TransactionDto>> => {
  const response = await api.put("/Transaction/changePin", request);
  return response.data;
}
