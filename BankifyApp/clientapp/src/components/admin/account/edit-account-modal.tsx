import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Input,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";

import {
  FaUser,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhone,
} from "react-icons/fa";

import { useEffect, useState } from "react";
import { AccountDto } from "../../../models/account";
import { updateAccount } from "../../../services/accountService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  account: AccountDto | null;
  refresh: () => void;
};

export default function EditAccountModal({
  isOpen,
  onClose,
  account,
  refresh,
}: Props) {
  const [currentAccount, setCurrentAccount] = useState<AccountDto>({
    accountNumber: 0,
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    location: "",
    phoneNumber: "",
    availableBalance: 0,
    status: "Active",
    createdDate: "",
  });

  // Sync incoming account
  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
    }
  }, [account]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setCurrentAccount((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await updateAccount(currentAccount);
      refresh();
      onClose();
    } catch (error: any) {
      console.error(
        "Update failed",
        error?.response?.data || error?.message || error
      );
      alert(
        `Update failed: ${
          error?.response?.data || error?.message || "Unknown error"
        }`
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />

      <ModalContent borderRadius="xl" p={2}>
        <ModalHeader>Edit Account</ModalHeader>

        <ModalBody>
          <VStack spacing={4}>
            
            {/* First Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser />
              </InputLeftElement>
              <Input
                name="firstName"
                placeholder="First Name"
                value={currentAccount.firstName}
                onChange={handleChange}
              />
            </InputGroup>

            {/* Middle Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser />
              </InputLeftElement>
              <Input
                name="middleName"
                placeholder="Middle Name"
                value={currentAccount.middleName}
                onChange={handleChange}
              />
            </InputGroup>

            {/* Last Name */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaUser />
              </InputLeftElement>
              <Input
                name="lastName"
                placeholder="Last Name"
                value={currentAccount.lastName}
                onChange={handleChange}
              />
            </InputGroup>

            {/* Email */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaEnvelope />
              </InputLeftElement>
              <Input
                name="email"
                placeholder="Email"
                value={currentAccount.email}
                onChange={handleChange}
              />
            </InputGroup>

            {/* Location */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaMapMarkerAlt />
              </InputLeftElement>
              <Input
                name="location"
                placeholder="Location"
                value={currentAccount.location}
                onChange={handleChange}
              />
            </InputGroup>

            {/* Phone */}
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <FaPhone />
              </InputLeftElement>
              <Input
                name="phoneNumber"
                placeholder="Phone Number"
                value={currentAccount.phoneNumber}
                onChange={handleChange}
              />
            </InputGroup>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Cancel
          </Button>

          <Button colorScheme="blue" onClick={handleUpdate}>
            Update
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}