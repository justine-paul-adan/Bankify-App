import { useState } from "react";
import {
  Button,
  Input,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { CreateBankifyUserDto } from "../../../models/bankifyUser";
import { createUser } from "../../../services/bankifyUserService";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import { RiContactsLine, RiLockPasswordFill } from "react-icons/ri";
import { FaUserCircle } from "react-icons/fa";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateUserModal({ isOpen, onClose }: Props) {
  const [user, setUser] = useState<CreateBankifyUserDto>({
    email: "",
    password: "",
    phoneNumber: "",
    accountNumber: 0,
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      await createUser(user);
      alert("User created successfully");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error creating user");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create User</ModalHeader>

        <ModalBody>
          <VStack spacing={4}>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaEnvelope color="gray" />
              </InputLeftElement>
              <Input
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUserCircle  color="gray" />
              </InputLeftElement>
              <Input
                name="role"
                placeholder="Role"
                onChange={handleChange}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <RiContactsLine color="gray" />
              </InputLeftElement>
              <Input
                name="accountNumber"
                placeholder="Account Number"
                onChange={handleChange}
              />
            </InputGroup>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaPhone color="gray" />
              </InputLeftElement>
              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                onChange={handleChange}
              />
            </InputGroup>

            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <RiLockPasswordFill  color="gray" />
              </InputLeftElement>
              <Input
                name="password"
                placeholder="Password"
                type="password"
                onChange={handleChange}
              />
            </InputGroup>

          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSubmit}>
            Create
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}