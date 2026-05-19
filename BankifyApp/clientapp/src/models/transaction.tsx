export interface TransactionDto {
  transactionRef: string;
  accountNumber: number;
  amount: number;
  type: string;
  createdBy: string;
  createdDate: string;
}

export interface RequestTransaction {
  accountNumber: number;
  amount: number;
  currentPin: string;
  newPin: string;
}

export interface ActivityDto {
  id: string;
  type: "user" | "account";
  message: string;
  createdAt: string;
};