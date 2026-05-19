import { useState } from "react";
import { Button, VStack, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, InputGroup, InputLeftElement, Input } from "@chakra-ui/react";
import { FaUser, FaEnvelope, FaMapMarkerAlt, FaPhone, FaMoneyBill } from "react-icons/fa";
import { CreateAccountDto } from "../../../models/account";
import { createAccount } from "../../../services/accountService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreateAccountModal({ isOpen, onClose }: Props) {
  const [account, setAccount] = useState<CreateAccountDto>({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    location: "",
    phoneNumber: "",
    availableBalance: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setAccount({
      ...account,
      [name]: name === "availableBalance" ? Number(value) : value,
    });
  };

  const handleSubmit = async () => {
    try {
      await createAccount(account);
      alert("Account created successfully");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error creating account");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader fontSize="lg" fontWeight="semibold">
          Create Account
        </ModalHeader>

        <ModalBody>
          <VStack spacing={4}>
            {/* First Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser color="gray" />
              </InputLeftElement>
              <Input
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
              />
            </InputGroup>

            {/* Middle Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser color="gray" />
              </InputLeftElement>
              <Input
                name="middleName"
                placeholder="Middle Name"
                onChange={handleChange}
              />
            </InputGroup>

            {/* Last Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser color="gray" />
              </InputLeftElement>
              <Input
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
              />
            </InputGroup>

            {/* Email */}
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

            {/* Location */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaMapMarkerAlt color="gray" />
              </InputLeftElement>
              <Input
                name="location"
                placeholder="Location"
                onChange={handleChange}
              />
            </InputGroup>

            {/* Phone */}
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

            {/* Balance */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaMoneyBill color="gray" />
              </InputLeftElement>
              <Input
                name="availableBalance"
                type="number"
                placeholder="Initial Balance"
                onChange={handleChange}
              />
            </InputGroup>
          </VStack>
        </ModalBody>

        <ModalFooter justifyContent="flex-end">
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