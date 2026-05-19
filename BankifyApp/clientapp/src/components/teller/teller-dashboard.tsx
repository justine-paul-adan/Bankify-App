import {
  Box,
  VStack,
  Heading,
  Card,
  CardBody,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Avatar,
  useToast,
  HStack,
  Text,
  Badge,
  Spinner,
  useDisclosure,
} from "@chakra-ui/react";
import {

  SearchIcon,
  DeleteIcon,
  EditIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import { useState } from "react";
import {
  deleteAccount,
  getAccountByNumber,
  updateAccount,
  // getTransactionsByAccount,
} from "../../services/accountService";
import { AccountDto } from "../../models/account";
import CreateAccountModal from "../admin/account/create-account-modal";

/* ---------------- EDIT MODAL ---------------- */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@chakra-ui/react";
import EditAccountModal from "../admin/account/edit-account-modal";

export default function TellerDashboard() {
  const toast = useToast();

  const [searchAccountNumber, setSearchAccountNumber] = useState("");
  const [account, setAccount] = useState<AccountDto | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const [openCreateAccount, setOpenCreateAccount] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure(); // delete
  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onClose: onEditClose,
  } = useDisclosure();

  const handleSearch = async () => {
    if (!searchAccountNumber) return;
    setHasSearched(true); // 👈 mark that search happened

    try {
      setLoadingSearch(true);
      const accountNumber = Number(searchAccountNumber);

      if (isNaN(accountNumber)) {
        toast({
          title: "Invalid account number",
          status: "error",
        });
        return;
      }

      const res = await getAccountByNumber(accountNumber);
      setAccount(res.data);

      // const tx = await getTransactionsByAccount(
      //   res.data.accountNumber
      // );
      // setTransactions(tx.data || []);
    } catch {
      setAccount(null);
      setTransactions([]);
    } finally {
      setLoadingSearch(false);
      setLoadingSearch(false);

    }
  };

  /* 🗑️ Delete */
  const handleDelete = async () => {
    if (!account) return;

    try {
      await deleteAccount(account.accountNumber);
      setAccount(null);
      setTransactions([]);
      onClose();

      toast({ title: "Deleted", status: "success" });
    } catch {
      toast({ title: "Delete failed", status: "error" });
    }
  };

  /* ✏️ Update */
  const handleUpdate = async (updated: AccountDto) => {
    try {
      await updateAccount(updated);
      setAccount(updated);
      onEditClose();

      toast({ title: "Updated successfully", status: "success" });
    } catch {
      toast({ title: "Update failed", status: "error" });
    }
  };

  return (
    <Box p={{ base: 4, md: 8 }} bg="gray.50" minH="100vh">
      <VStack align="stretch" spacing={6} maxW="7xl" mx="auto">
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          gap={4}
        >
          <Box>
            <Heading size="xl" letterSpacing="tight">
              Secure Account Lookup
            </Heading>
            <Text fontSize="md" color="gray.600" mt={2} maxW="2xl">
              Search and manage accounts securely from a clean teller dashboard.
            </Text>
          </Box>

          <Button
            colorScheme="green"
            size="lg"
            onClick={() => setOpenCreateAccount(true)}
          >
            + New Account
          </Button>
        </Flex>

        <Card bg="white" rounded="2xl" shadow="lg" overflow="hidden">
          <CardBody>
            <VStack spacing={5} align="stretch">
              <Box>
                <Text fontWeight="semibold" color="gray.700">
                  Account Search
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Search by account number, name, or email.
                </Text>
              </Box>

              <HStack spacing={3} align="flex-end" wrap="wrap">
                <InputGroup flex={1} minW="280px" bg="gray.50" borderRadius="xl" overflow="hidden">
                  <InputLeftElement pointerEvents="none" color="gray.400">
                    <SearchIcon />
                  </InputLeftElement>
                  <Input
                    type="text"
                    placeholder="Search by account number, name, or email..."
                    value={searchAccountNumber}
                    onChange={(e) => {
                      setSearchAccountNumber(e.target.value);
                      setHasSearched(false);
                    }} onKeyDown={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                    border="none"
                    bg="transparent"
                  />
                  {searchAccountNumber && (
                    <InputRightElement>
                      <IconButton
                        aria-label="Clear search"
                        icon={<CloseIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setSearchAccountNumber("")}
                      />
                    </InputRightElement>
                  )}
                </InputGroup>

                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleSearch}
                  isLoading={loadingSearch}
                >
                  Search
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {loadingSearch && (
          <Flex justify="center" py={6}>
            <Spinner color="blue.500" size="lg" />
          </Flex>
        )}

        {!loadingSearch && hasSearched && !account && (
          <Card bg="white" rounded="2xl" shadow="md">
            <CardBody>
              <Text color="gray.600">No account found. Try a different account number.</Text>
            </CardBody>
          </Card>
        )}

        {account && (
          <Card bg="white" rounded="2xl" shadow="lg" overflow="hidden">
            <CardBody>
              <Flex direction={{ base: "column", md: "row" }} justify="space-between" align="center" gap={6}>
                <HStack spacing={4} align="center" flex={1} minW="220px">
                  <Avatar
                    name={`${account.firstName} ${account.lastName}`}
                    size="lg"
                    bg="blue.100"
                    color="blue.700"
                  />
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      {account.firstName} {account.middleName} {account.lastName}
                    </Text>
                    <Text color="gray.500">{account.email}</Text>
                    <Text color="gray.500" fontSize="sm">
                      Account #{account.accountNumber}
                    </Text>
                  </Box>
                </HStack>

                <VStack spacing={1} flex={1} align="flex-start">
                  <Text color="gray.500" fontSize="sm">
                    Balance
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                    ₱ {account.availableBalance}
                  </Text>
                </VStack>

                <VStack spacing={4} flex={1} align="flex-start" minW="220px">
                  <Text color="gray.500" fontSize="sm">
                    Status
                  </Text>
                  <Badge
                    colorScheme={account.status === "ACTIVE" ? "green" : "red"}
                    variant="subtle"
                    px={4}
                    py={2}
                    rounded="full"
                  >
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1).toLowerCase()}
                  </Badge>
                  <HStack spacing={3} pt={2}>
                    <Button
                      size="md"
                      leftIcon={<EditIcon />}
                      onClick={onEditOpen}
                      colorScheme="blue"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <Button
                      size="md"
                      colorScheme="red"
                      leftIcon={<DeleteIcon />}
                      onClick={onOpen}
                    >
                      Delete
                    </Button>
                  </HStack>
                </VStack>
              </Flex>
            </CardBody>
          </Card>
        )}

        {transactions.length > 0 && (
          <Card bg="white" rounded="2xl" shadow="lg" overflow="hidden">
            <CardBody>
              <Heading size="md" mb={4}>
                Transaction History
              </Heading>

              <VStack spacing={3} align="stretch">
                {transactions.map((tx, i) => (
                  <Box
                    key={i}
                    p={4}
                    bg="gray.50"
                    rounded="lg"
                    border="1px solid"
                    borderColor="gray.100"
                  >
                    <Flex justify="space-between" align="center" wrap="wrap" gap={3}>
                      <Text fontWeight="semibold">{tx.type}</Text>
                      <Text fontWeight="semibold">₱ {tx.amount}</Text>
                    </Flex>
                    <Text fontSize="sm" color="gray.500" mt={1}>
                      {tx.date}
                    </Text>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        )}
      </VStack>

      {/* DELETE MODAL */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalBody>Are you sure you want to delete this account?</ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* EDIT MODAL */}
      <EditAccountModal
        isOpen={isEditOpen}
        onClose={onEditClose}
        account={account}
        refresh={() => {
          if (account) handleUpdate(account);
        }}
      />

      {/* CREATE MODAL */}
      {openCreateAccount && (
        <CreateAccountModal
          isOpen={openCreateAccount}
          onClose={() => setOpenCreateAccount(false)}
        />
      )}
    </Box>
  );
}