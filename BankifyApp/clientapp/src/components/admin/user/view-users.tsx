import s from "../user/view-user.module.scss";
import { BankifyUserDto } from "../../../models/bankifyUser";
import { deleteUser, getAllUsers } from "../../../services/bankifyUserService";
import { useAuth } from "../../../context/authContext";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  Center,
  Text,
  Spinner,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Button,
  Flex,
  Input,
  Avatar,
  Badge,
  Divider,
  useToast,
  VStack
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { BsTrash } from "react-icons/bs";
import { FaRegEdit, FaPlus } from "react-icons/fa";
import { IoIosWarning } from "react-icons/io";
import EditUserModal from "./edit-user-modal";
import CreateUserModal from "./create-user-modal";

export default function ViewUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const DELETE_TOAST_ID = "delete-toast";

  const [users, setUsers] = useState<BankifyUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BankifyUserDto | null>(null);
  const [openCreateUser, setOpenCreateUser] = useState(false);

  const pendingDeleteRef = useRef<{ user: BankifyUserDto; index: number } | null>(null);
  const deleteTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data || []);
    } catch {
      toast({ title: "Failed to fetch users", status: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user || user.role === "User") {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleDelete = (selectedUser: BankifyUserDto) => {
    const index = users.findIndex((u) => u.userRef === selectedUser.userRef);

    pendingDeleteRef.current = { user: selectedUser, index };

    setUsers((prev) => prev.filter((u) => u.userRef !== selectedUser.userRef));

    deleteTimerRef.current = setTimeout(async () => {
      await deleteUser(selectedUser.userRef);
      pendingDeleteRef.current = null;
    }, 5000);

    toast({
      id: DELETE_TOAST_ID,
      duration: 5000,
      isClosable: true,
      render: () => (
        <Flex align="center" justify="space-between" bg="orange.500" color="white" px={3} py={2} borderRadius="md" gap={4}>
          <IoIosWarning size={20} />
          <Text>User marked for deletion</Text>
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
      setUsers((prev) => {
        const copy = [...prev];
        copy.splice(pending.index, 0, pending.user);
        return copy;
      });
    }

    pendingDeleteRef.current = null;
    toast.close(DELETE_TOAST_ID);

    toast({ title: "Deletion cancelled", status: "success", duration: 2000 });
  };

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase();

    return users.filter((u) =>
      [u.email, u.phoneNumber, u.role, u.accountNumber]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, users]);

  const roleColorMap: Record<string, string> = {
    Admin: "green",
    Teller: "blue",
    User: "gray",
  };

  const UserCard = ({
    user,
    onDelete,
  }: {
    user: BankifyUserDto;
    onDelete: (user: BankifyUserDto) => void;
  }) => (
    <Flex className={s.userCard}>
      <Flex className={s.userInfo}>
        <Avatar name={user.email} />
        <Box className={s.userDetails}>
          <Text fontWeight="bold">{user.email}</Text>
          <Text fontSize="sm" color="gray.500">
            {user.phoneNumber}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Account #{user.accountNumber}
          </Text>
        </Box>
      </Flex>

      <Divider orientation="vertical" className={s.verticalDivider} />

      <Box className={s.roleSection}>
        <Flex className={s.roleRow}>
          <Text fontWeight="bold">Role:</Text>
          <Badge colorScheme={roleColorMap[user.role] || "gray"}>
            {user.role}
          </Badge>
        </Flex>

        <Flex className={s.actions}>
          <Button
            size="sm"
            variant="outline"
            leftIcon={<FaRegEdit />}
            onClick={() => {
              setSelectedUser(user);
              setIsEditOpen(true);
            }}
          >
            Edit
          </Button>

          <Button
            size="sm"
            colorScheme="red"
            leftIcon={<BsTrash />}
            onClick={() => onDelete(user)}
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
          <BreadcrumbLink>Users</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex className={s.header}>
        <VStack align="start" spacing={0} className={s.titleGroup}>
          <Heading size="lg">Users Lookup</Heading>
          <Text className={s.subtitle}>
            Search and manage users
          </Text>
        </VStack>

        <Button
          colorScheme="green"
          leftIcon={<FaPlus />}
          onClick={() => setOpenCreateUser(true)}
        >
          New User
        </Button>
      </Flex>

      <Box className={s.searchBox}>
        <Heading size="md" mb={2}>
          User Search
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

      {filteredUsers.length === 0 ? (
        <Text className={s.emptyState}>No users found</Text>
      ) : (
        filteredUsers.map((u) => (
          <UserCard key={u.userRef} user={u} onDelete={handleDelete} />
        ))
      )}

      {selectedUser && (
        <EditUserModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          user={selectedUser}
          refresh={fetchUsers}
        />
      )}

      {openCreateUser && (
        <CreateUserModal
          isOpen={openCreateUser}
          onClose={() => setOpenCreateUser(false)}
        />
      )}
    </Box>
  );
}