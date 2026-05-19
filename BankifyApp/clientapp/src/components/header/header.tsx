import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Link,
  Text,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Badge,
  Divider,
  Icon,
  Input,
  useToast,
  InputGroup,
  InputLeftElement,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import s from "./header.module.scss";

import { Login } from "../logins/login";
import { useAuth } from "../../context/authContext";
import { FiLock, FiLogOut, FiUser, FiUsers } from "react-icons/fi";
import { RxDashboard } from "react-icons/rx";
import { LuBanknote } from "react-icons/lu";
import { GrTransaction } from "react-icons/gr";
import { updateUser } from "../../services/bankifyUserService";
import { BankifyUserDto, UpdateBankifyUserDto } from "../../models/bankifyUser";
import { FaEnvelope, FaLock, FaPhone, FaUserTag } from "react-icons/fa";

import logo from "../assets/logo1.png";
import { SignUp } from "../logins/signUp";

/* ================= NAV CONFIG ================= */
const NAV_CONFIG: Record<string, any[]> = {
  Admin: [
    { label: "Dashboard", icon: <RxDashboard />, href: "/admin/dashboard" },
    { label: "Users", icon: <FiUsers />, href: "/admin/users" },
    { label: "Accounts", icon: <LuBanknote />, href: "/admin/accounts" },
  ],
  Teller: [
    { label: "Dashboard", icon: <RxDashboard />, href: "/teller/dashboard" },
  ],
  User: [
    { label: "Transactions", icon: <GrTransaction />, href: "/transactions" },
  ],
};

const getInitials = (email?: string): string => {
  if (!email) return "UN";
  return email.split("@")[0].slice(0, 2).toUpperCase();
};

const Header = () => {
  const { user, setUser, logout } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  const [currentUser, setCurrentUser] = useState<UpdateBankifyUserDto>({
    userRef: "",
    email: "",
    role: "",
    password: "",
    newPassword: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (user) {
      setCurrentUser({
        userRef: user.userRef ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        password: "",
        newPassword: "",
        phoneNumber: user.phoneNumber ?? "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentUser((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!currentUser.email.includes("@")) {
      toast({ title: "Invalid email", status: "warning" });
      return false;
    }

    if (currentUser.newPassword && currentUser.newPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", status: "warning" });
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);

      const res = await updateUser(currentUser);
      const updatedUser = res.data as BankifyUserDto;

      if (!updatedUser) {
        throw new Error("Invalid user response");
      }

      localStorage.setItem("bankify_user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast({
        title: "Profile updated successfully",
        status: "success",
        duration: 3000,
      });

      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Update failed",
        status: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= DERIVED ================= */
  const navItems = NAV_CONFIG[user?.role || "User"] || [];


  const hasChanges =
    currentUser.email !== (user?.email ?? "") ||
    (user?.role === "Admin" && currentUser.role !== (user?.role ?? "")) ||
    currentUser.phoneNumber !== (user?.phoneNumber ?? "") ||
    (currentUser.password !== "" && currentUser.password.length >= 6 && currentUser.newPassword !== "" && currentUser.newPassword.length >= 6);

  return (
    <Box className={s.header}>
      <Flex align="center" justify="space-between" w="100%">
        {/* LOGO */}
        <Link as={RouterLink} to="/" className={s.logo}>
          <img src={logo} alt="Bankify Logo" />
          <span>Bankify</span>
        </Link>

        {/* NAV */}
        <HStack spacing={8}>
          {user &&
            navItems.map((nav) => (
              <Link
                key={nav.label}
                as={RouterLink}
                to={nav.href}
                className={s.navLinks}
                fontWeight="bold"
              >
                {nav.icon} {nav.label}
              </Link>
            ))}
        </HStack>

        {/* ACTIONS */}
        <Flex align="center">
          {!user ? (
            <Flex gap={2}>
              <Button onClick={() => setIsLoginOpen(true)}>Login</Button>
              <Button onClick={() => setIsRegisterOpen(true)}>Register</Button>
            </Flex>
          ) : (
            <Menu>
              <MenuButton>
                <Avatar
                  size="sm"
                  name={user.email}
                  getInitials={getInitials}
                />
              </MenuButton>

              <MenuList p={3}>
                <Flex align="center" mb={3}>
                  <Avatar size="md" name={user.email} />
                  <Box ml={3}>
                    <Text fontWeight="bold">{user.email}</Text>
                    <Badge colorScheme="green">{user.role}</Badge>
                  </Box>
                </Flex>

                <Divider />

                <MenuItem
                  icon={<Icon as={FiUser} />}
                  onClick={() => {
                    setActiveTab("profile");
                    setIsProfileOpen(true);
                  }}
                >
                  Profile
                </MenuItem>

                <MenuItem
                  icon={<Icon as={FiLock} />}
                  onClick={() => {
                    setActiveTab("security");
                    setIsProfileOpen(true);
                  }}
                >
                  Security
                </MenuItem>

                <Divider />

                <MenuItem
                  icon={<Icon as={FiLogOut} />}
                  color="red.500"
                  onClick={() => logout(false)}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>

      {/* LOGIN MODAL */}
      <Modal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Login onSuccess={() => setIsLoginOpen(false)} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* REGISTER MODAL */}
      <Modal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <SignUp onSuccess={() => setIsRegisterOpen(false)} />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* PROFILE MODAL */}
      <Modal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Profile</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Flex mb={4}>
              <Button onClick={() => setActiveTab("profile")}>Profile</Button>
              <Button onClick={() => setActiveTab("security")}>Security</Button>
            </Flex>

            {activeTab === "profile" && (
              <>
                <InputGroup mb={3}>
                  <InputLeftElement children={<FaEnvelope />} />
                  <Input
                    name="email"
                    value={currentUser.email}
                    onChange={handleChange}
                    placeholder="Email"
                  />
                </InputGroup>

                <InputGroup mb={3}>
                  <InputLeftElement children={<FaPhone />} />
                  <Input
                    name="phoneNumber"
                    value={currentUser.phoneNumber}
                    onChange={handleChange}
                    placeholder="Phone"
                  />
                </InputGroup>

                {user?.role === "Admin" && (
                  <InputGroup mb={3}>
                    <InputLeftElement children={<FaUserTag />} />
                    <Input
                      name="role"
                      value={currentUser.role}
                      onChange={handleChange}
                    />
                  </InputGroup>
                )}
              </>
            )}

            {activeTab === "security" && (
              <>
                <InputGroup mb={3}>
                  <InputLeftElement children={<FaLock />} />
                  <Input
                    type="password"
                    name="password"
                    value={currentUser.password}
                    onChange={handleChange}
                    placeholder="Current Password"
                  />
                </InputGroup>

                <InputGroup mb={3}>
                  <InputLeftElement children={<FaLock />} />
                  <Input
                    type="password"
                    name="newPassword"
                    value={currentUser.newPassword}
                    onChange={handleChange}
                    placeholder="New Password"
                  />
                </InputGroup>
              </>
            )}

            <Flex justify="flex-end" mt={4}>
              <Button mr={3} onClick={() => setIsProfileOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleSaveProfile}
                isLoading={isSaving}
                isDisabled={!hasChanges}
              >
                Save
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Header;