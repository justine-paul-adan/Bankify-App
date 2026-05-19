import { ChevronRightIcon } from "@chakra-ui/icons";
import { useToast, Text, Flex, Button, Avatar, Box, Divider, Badge, Center, Spinner, Breadcrumb, BreadcrumbItem, BreadcrumbLink, VStack, Heading, Input } from "@chakra-ui/react";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { BsTrash } from "react-icons/bs";
import { FaRegEdit, FaPlus } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { deleteAccount, getAllAccounts } from "../../../services/accountService";
import { AccountDto } from "../../../models/account";
import CreateAccountModal from "./create-account-modal";
import EditAccountModal from "./edit-account-modal";
import s from "../account/view-account.module.scss";

export default function ViewAccounts() {
  const { user: account } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const DELETE_TOAST_ID = "delete-toast";

  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountDto | null>(null);
  const [openCreateAccount, setOpenCreateAccount] = useState(false);

  const pendingDeleteRef = useRef<{ user: AccountDto; index: number } | null>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllAccounts();
      setAccounts(res.data || []);
    } catch {
      toast({ title: "Failed to fetch accounts", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!account || account.role === "User") {
      navigate("/");
      return;
    }
    fetchAccounts();
  }, [account, navigate, fetchAccounts]);

  const handleDelete = (selectedUser: AccountDto) => {
    const index = accounts.findIndex((u) => u.accountNumber === selectedUser.accountNumber);

    pendingDeleteRef.current = { user: selectedUser, index };

    setAccounts((prev) => prev.filter((u) => u.accountNumber !== selectedUser.accountNumber));

    deleteTimerRef.current = setTimeout(async () => {
      await deleteAccount(selectedUser.accountNumber);
      pendingDeleteRef.current = null;
    }, 5000);

    toast({
      id: DELETE_TOAST_ID,
      duration: 5000,
      isClosable: true,
      render: () => (
        <Flex align="center" justify="space-between" bg="orange.500" color="white" px={3} py={2} borderRadius="md" gap={4}>
          <IoIosWarning size={20} />
          <Text>Account marked for deletion</Text>
          <Button size="sm" onClick={handleUndo}>
            Undo
          </Button>
        </Flex>
      ),
    });
  };

  const handleUndo = () => {
    if (deleteTimerRef.current) clearTimeout(deleteTimerRef.current);

    const pending = pendingDeleteRef.current;
    if (pending) {
      setAccounts((prev) => {
        const copy = [...prev];
        copy.splice(pending.index, 0, pending.user);
        return copy;
      });
    }

    pendingDeleteRef.current = null;
    toast.close(DELETE_TOAST_ID);

    toast({ title: "Deletion cancelled", status: "success", duration: 2000 });
  };

  const filteredAccounts = useMemo(() => {
    const term = search.toLowerCase();

    return accounts.filter((u) =>
      [u.email, u.phoneNumber, u.firstName, u.lastName, u.location, u.status, u.accountNumber]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, accounts]);

  const roleColorMap: Record<string, string> = {
    Active: "green",
    Frozen: "grey",
    Closed: "red",
  };

  const AccountCard = ({
    account,
    onDelete,
  }: {
    account: AccountDto;
    onDelete: (account: AccountDto) => void;
  }) => (
    <Flex className={s.userCard}>
      <Flex className={s.userInfo}>
        <Avatar name={account.email} />
        <Box className={s.userDetails}>
          <Text fontWeight="bold">{account.email}</Text>
          <Text fontSize="sm" color="gray.500">
            {account.phoneNumber}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Account #{account.accountNumber}
          </Text>
        </Box>
      </Flex>

      <Divider orientation="vertical" className={s.verticalDivider} />

      <Box className={s.roleSection}>
        <Flex className={s.roleRow}>
          <Text fontWeight="bold">Role:</Text>
          <Badge colorScheme={roleColorMap[account.status] || "gray"}>
            {account.status}
          </Badge>
        </Flex>

        <Flex className={s.actions}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FaRegEdit />}
            onClick={() => {
              setSelectedAccount(account);
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            colorScheme="red"
            leftIcon={<BsTrash />}
            onClick={() => onDelete(account)}
          >
            Delete
          </Button>
        </Flex>
      </Box>
    </Flex>
  );

  if (loading) {
    return (
      <Center mt={10}>
        <Spinner size="xl" />
      </Center>
    );
  }

  return (
    <Box className={s.container}>
     <Breadcrumb fontSize="xs" color="gray.500" separator={<ChevronRightIcon />}>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/")}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Accounts</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex className={s.header}>
        <VStack align="start" spacing={0} className={s.titleGroup}>
          <Heading size="lg">Accounts Lookup</Heading>
          <Text className={s.subtitle}>
            Search and manage accounts
          </Text>
        </VStack>

        <Button
          colorScheme="green"
          leftIcon={<FaPlus />}
          onClick={() => setOpenCreateAccount(true)}
        >
          New Account
        </Button>
      </Flex>

      <Box className={s.searchBox}>
        <Heading size="md" mb={2}>
          Account Search
        </Heading>
        <Input
          placeholder="Search by email, phone, role, account #"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <Heading size="sm" className={s.sectionTitle}>
        Account Info
      </Heading>

      {filteredAccounts.length === 0 ? (
        <Text className={s.emptyState}>No accounts found</Text>
      ) : (
        filteredAccounts.map((a) => (
          <AccountCard key={a.accountNumber} account={a} onDelete={handleDelete} />
        ))
      )}

      {selectedAccount && (
        <EditAccountModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          account={selectedAccount}
          refresh={fetchAccounts}
        />
      )}

      {openCreateAccount && (
        <CreateAccountModal
          isOpen={openCreateAccount}
          onClose={() => setOpenCreateAccount(false)}
        />
      )}
    </Box>
  );
}