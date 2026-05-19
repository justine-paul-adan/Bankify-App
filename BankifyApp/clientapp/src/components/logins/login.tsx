import { useState } from "react";
import {
  Box,
  Input,
  Button,
  VStack,
  Heading,
  Text,
  Link,
  FormControl,
  FormLabel,
  HStack,
} from "@chakra-ui/react";
import { useAuth } from "../../context/authContext";
import { UserLoginDto } from "../../models/bankifyUser";
import { login } from "../../services/bankifyUserService";

interface LoginProps {
  onSuccess?: () => void;
}

export const Login = ({ onSuccess }: LoginProps) => {
  const { setUser } = useAuth();

  const [userLogin, setUserLogin] = useState<UserLoginDto>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<UserLoginDto>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserLogin((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validate = () => {
    const errs: Partial<UserLoginDto> = {};

    if (!userLogin.email) {
      errs.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(userLogin.email)) {
      errs.email = "Invalid email format";
    }

    if (!userLogin.password) {
      errs.password = "Password is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid = () => {
    return (
      userLogin.email &&
      userLogin.password &&
      Object.keys(errors).length === 0
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await login(userLogin);
      if (response.isSuccess) {
        setUser(response.data?.user || null);
        localStorage.setItem("token", response.data?.token || "");
        onSuccess?.();
      }
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10} p={8} boxShadow="md" borderRadius="lg">
      <Heading mb={6} textAlign="center">
        Login
      </Heading>

      <form onSubmit={handleSubmit} autoComplete="off">
        <VStack spacing={4} align="stretch">
          {/* Email */}
          <FormControl isInvalid={!!errors.email}>
            <HStack justify="space-between">
              <FormLabel>Email</FormLabel>
              {errors.email && (
                <Text fontSize="sm" color="red.500">
                  {errors.email}
                </Text>
              )}
            </HStack>
            <Input
              type="text"
              name="email"
              value={userLogin.email}
              onChange={handleChange}
            />
          </FormControl>

          {/* Password */}
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
              value={userLogin.password}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isDisabled={!isFormValid()}
          >
            Login
          </Button>

          <Link color="blue.500" fontSize="sm" alignSelf="flex-end">
            Forgot Password?
          </Link>
        </VStack>
      </form>
    </Box>
  );
};