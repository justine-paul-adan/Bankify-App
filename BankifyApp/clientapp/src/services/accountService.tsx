import { AccountDto, CreateAccountDto } from "../models/account";
import { ResponseDto } from "../models/response";
import api from "./api";

export const getAllAccounts = async (): Promise<ResponseDto<AccountDto[]>> => {
  const response = await api.get("/Account/GetAllAccount");
  return response.data;
};

export const getAccountByNumber = async (accountNumber: number): Promise<ResponseDto<AccountDto>> => {
  const response = await api.get(`/Account/GetAccountByNumber/${accountNumber}`);
  return response.data;
};

export const createAccount = async (account: CreateAccountDto): Promise<ResponseDto<AccountDto>> => {
  const response = await api.post("/Account/CreateAccount", account);
  return response.data;
};

export const updateAccount = async (account: AccountDto): Promise<ResponseDto<AccountDto>> => {
  const response = await api.put("/Account/UpdateAccount", account);
  return response.data;
};

export const deleteAccount = async (accountNumber: number): Promise<ResponseDto<null>> => {
  const response = await api.delete(`/Account/DeleteAccount/${accountNumber}`);
  return response.data;
};