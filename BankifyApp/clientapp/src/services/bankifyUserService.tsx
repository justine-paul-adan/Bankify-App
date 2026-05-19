import { BankifyUserDto, CreateBankifyUserDto, LoginResponse, UpdateBankifyUserDto, UserLoginDto } from "../models/bankifyUser";
import { ResponseDto } from "../models/response";
import api from "./api";

export const getAllUsers = async (): Promise<ResponseDto<BankifyUserDto[]>> => {
  const response = await api.get("/bankifyuser/getAllBankifyUser");
  return response.data;
};

export const getUserByRef = async (userRef: string): Promise<ResponseDto<BankifyUserDto>> => {
  const response = await api.get(`/bankifyuser/GetBankifyUserByUserRef/${userRef}`);
  return response.data;
};

export const createUser = async (data: CreateBankifyUserDto): Promise<ResponseDto<BankifyUserDto>> => {
  const response = await api.post("/bankifyuser/CreateBankifyUser", data);
  return response.data;
};

export const updateUser = async (data: UpdateBankifyUserDto): Promise<ResponseDto<BankifyUserDto>> => {
  const response = await api.put("/bankifyuser/UpdateBankifyUser", data);
  return response.data;
};

export const deleteUser = async (userRef: string): Promise<ResponseDto<null>> => {
  const response = await api.delete(`/bankifyuser/DeleteBankifyUser/${userRef}`);
  return response.data;
};

export const login = async (data: UserLoginDto): Promise<ResponseDto<LoginResponse>> => {
  const response = await api.post("/bankifyuser/Login", data);
  localStorage.setItem("bankify_user", JSON.stringify(response.data?.user || null));
  localStorage.setItem("token", response.data?.token || "");
  return response.data;
};