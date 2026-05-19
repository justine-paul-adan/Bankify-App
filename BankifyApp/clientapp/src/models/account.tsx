export interface AccountDto {
  accountNumber: number;
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  location: string;
  phoneNumber: string;
  availableBalance: number;
  status: string;
  createdDate: string;
}

export interface CreateAccountDto {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  location: string;
  phoneNumber: string;
  availableBalance: number;
}