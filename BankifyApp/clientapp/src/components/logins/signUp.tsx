import React, { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { createUser } from "../../services/bankifyUserService";
import { CreateBankifyUserDto } from "../../models/bankifyUser";

type FormErrors = Partial<CreateBankifyUserDto> & {
  confirmPassword?: string;
};

interface SignUpProps {
  onSuccess?: () => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const [bankifyUser, setBankifyUser] = useState<CreateBankifyUserDto>({
    email: "",
    password: "",
    phoneNumber: "",
    accountNumber: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setBankifyUser((prev) => ({
      ...prev,
      [name]: name === "accountNumber" ? value : value,
    }));
  };

  const validate = () => {
    const errs: FormErrors = {};

    if (!bankifyUser.email) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(bankifyUser.email)) {
      errs.email = "Invalid email format";
    }

    if (!bankifyUser.phoneNumber) {
      errs.phoneNumber = "Phone number is required";
    }

    if (!bankifyUser.accountNumber || bankifyUser.accountNumber === "0") {
      errs.accountNumber = "Account number is required";
    }

    if (!bankifyUser.password) {
      errs.password = "Password is required";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Confirm password is required";
    } else if (bankifyUser.password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid = () => {
    return (
      bankifyUser.email &&
      bankifyUser.password &&
      bankifyUser.phoneNumber &&
      bankifyUser.accountNumber &&
      bankifyUser.accountNumber !== "0" &&
      confirmPassword &&
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await createUser(bankifyUser);
    onSuccess?.();
  };

  return (
    <Box maxW="md" mx="auto" p={4} boxShadow="md" borderRadius="lg">
      <Heading mb={4} textAlign="center">
        Create Account
      </Heading>

      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isInvalid={!!errors.email}>
            <HStack justify="space-between">
              <FormLabel>Email Address</FormLabel>
              {errors.email && (
                <Text fontSize="sm" color="red.500">
                  {errors.email}
                </Text>
              )}
            </HStack>
            <Input
              name="email"
              value={bankifyUser.email}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.phoneNumber}>
            <HStack justify="space-between">
              <FormLabel>Phone Number</FormLabel>
              {errors.phoneNumber && (
                <Text fontSize="sm" color="red.500">
                  {errors.phoneNumber}
                </Text>
              )}
            </HStack>
            <Input
              name="phoneNumber"
              value={bankifyUser.phoneNumber}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.accountNumber}>
            <HStack justify="space-between">
              <FormLabel>Account Number</FormLabel>
              {errors.accountNumber && (
                <Text fontSize="sm" color="red.500">
                  {errors.accountNumber}
                </Text>
              )}
            </HStack>
            <Input
              type="number"
              name="accountNumber"
              value={bankifyUser.accountNumber || ""}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.password}>
            <HStack justify="space-between">
              <FormLabel>Password</FormLabel>
              {errors.password && (
                <Text fontSize="sm" color="red.500">
                  {errors.password}
                </Text>
              )}
            </HStack>
            <Input
              type="password"
              name="password"
              value={bankifyUser.password}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isInvalid={!!errors.confirmPassword}>
            <HStack justify="space-between">
              <FormLabel>Confirm Password</FormLabel>
              {errors.confirmPassword && (
                <Text fontSize="sm" color="red.500">
                  {errors.confirmPassword}
                </Text>
              )}
            </HStack>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isDisabled={!isFormValid()}
          >
            Sign Up
          </Button>
        </VStack>
      </form>
    </Box>
  );
};