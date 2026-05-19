export interface BankifyUserDto {
  userRef: string;
  email: string;
  role: string;
  accountNumber: number;
  phoneNumber: string;
  createdDate: string;
}
   
export interface CreateBankifyUserDto {
  email: string;
  password: string;
  phoneNumber: string;
  accountNumber: number;
  role: string;
}

export interface UpdateBankifyUserDto {
  userRef: string;
  email: string;
  password: string;
  newPassword: string;
  role: string;
  phoneNumber: string;
}

export interface UserLoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
    token: string;
    user: BankifyUserDto;
}