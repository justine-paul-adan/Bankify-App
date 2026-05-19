import { ChevronRightIcon, HamburgerIcon } from "@chakra-ui/icons";
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Button, Card, Text, CardBody, Flex, Heading, HStack, SimpleGrid, CardHeader, GridItem, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import s from "./admin-dashboard.module.scss";
import { FaExclamationTriangle, FaUniversity, FaUser, FaUsers, FaPlus } from "react-icons/fa";
import { useEffect, useState } from "react";
import { GoAlert } from "react-icons/go";
import { AccountDto } from "../../models/account";
import { BankifyUserDto } from "../../models/bankifyUser";
import { AiOutlineDollarCircle } from "react-icons/ai";
import { CiBank } from "react-icons/ci";
import { getAllAccounts } from "../../services/accountService";
import { getAllUsers } from "../../services/bankifyUserService";
import { XAxis, YAxis, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";
import { ActivityDto } from "../../models/transaction";
import CreateAccountModal from "./account/create-account-modal";
import CreateUserModal from "./user/create-user-modal";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [openCreateAccount, setOpenCreateAccount] = useState(false);
  const [openCreateUser, setOpenCreateUser] = useState(false);
  const [accounts, setAccounts] = useState<AccountDto[]>([]);
  const [users, setUsers] = useState<BankifyUserDto[]>([]);
  const [activeChart, setActiveChart] = useState<"users" | "accounts">("users");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [u, a] = await Promise.all([getAllUsers(), getAllAccounts()]);
        setUsers(u.data || []);
        setAccounts(a.data || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  const usersThisWeek = users.filter(user => {
    const created = new Date(user.createdDate);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return created >= startOfWeek;
  }).length;

  const accountsThisWeek = accounts.filter(account => {
    const created = new Date(account.createdDate);
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return created >= startOfWeek;
  }).length;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <FaUser color="#3182CE" />;
      case "account":
        return <FaUniversity color="#38A169" />;
      case "alert":
        return <FaExclamationTriangle color="#DD6B20" />;
      default:
        return null;
    }
  };

  const safeParseDate = (dateString?: string) => {
    if (!dateString) return new Date(0);
    const fixed = dateString.replace(/\.(\d{3})\d+/, ".$1");
    return new Date(fixed);
  };

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = safeParseDate(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    const diff = Math.floor((Date.now() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return `${Math.floor(diff / 86400)}d ago`;
  };

  const RecentActivity = ({ activities }: { activities: ActivityDto[] }) => (
    <Card h="100%" className={s.card}>
      <CardBody>
        <Text className={s.recentActivityTitle}>Recent Activity</Text>

        <VStack align="stretch" spacing={4}>
          {activities.map(activity => (
            <HStack key={activity.id} align="start" spacing={3}>
              <Box mt={1}>{getActivityIcon(activity.type)}</Box>

              <Box flex="1">
                <Text fontSize="sm">{activity.message}</Text>
                <Text fontSize="xs" color="gray.500">
                  {formatTimeAgo(activity.createdAt)}
                </Text>
              </Box>
            </HStack>
          ))}
        </VStack>
      </CardBody>
    </Card>
  );

  const getLast4MonthsData = <T extends { createdDate: string }>(data: T[]) => {
    const now = new Date();
    const result: { name: string; value: number }[] = [];

    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", { month: "short" });

      const count = data.filter(item => {
        const d = new Date(item.createdDate);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      }).length;

      result.push({ name: monthName, value: count });
    }

    return result;
  };

  const chartData =
    activeChart === "users"
      ? getLast4MonthsData(users)
      : getLast4MonthsData(accounts);

  const activities = [
    ...users.map(user => ({
      id: `user-${user.userRef}`,
      type: "user" as const,
      message: `${user.email} created`,
      createdAt: user.createdDate
    })),
    ...accounts.map(acc => ({
      id: `account-${acc.accountNumber}`,
      type: "account" as const,
      message: `${acc.accountNumber} created`,
      createdAt: acc.createdDate
    }))
  ]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <Box className={s.container}>
      <Breadcrumb fontSize="xs" color="gray.500" separator={<ChevronRightIcon />}>
        <BreadcrumbItem>
          <BreadcrumbLink onClick={() => navigate("/")}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Admin Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Heading className={s.heading}>Admin Dashboard</Heading>

      {/* Quick Actions */}
      <SimpleGrid columns={{ base: 1, md: 2 }} className={s.section}>
        <Card className={s.card}>
          <CardBody>
            <Flex className={s.flexBetween}>
              <Text fontWeight="medium">Quick Actions</Text>

              <HStack spacing={2}>
                <Button size="sm" colorScheme="blue" leftIcon={<FaPlus />} onClick={() => setOpenCreateUser(true)}>
                  Add User
                </Button>

                <Button size="sm" colorScheme="green" leftIcon={<FaPlus />} onClick={() => setOpenCreateAccount(true)}>
                  Create Account
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>

        <Card className={s.card}>
          <CardBody>
            <Flex className={s.flexBetween}>
              <Text fontWeight="medium">Quick Actions</Text>

              <Button size="sm" variant="outline" leftIcon={<HamburgerIcon />} isDisabled>
                View Reports
              </Button>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Stats */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} className={s.section}>
        <Card className={s.card}>
          <CardHeader>
            <Flex gap="4" alignItems="center">
              <FaUsers size={30} color="blue" />
              <Heading size="sm">Total Users</Heading>
            </Flex>
          </CardHeader>
          <CardBody className={s.cardBodyTight}>
            <Text>{users.length}</Text>
            <Text color="green">↑ {usersThisWeek} this week</Text>
          </CardBody>
        </Card>

        <Card className={s.card}>
          <CardHeader>
            <Flex gap="4" alignItems="center">
              <CiBank size={30} color="green" />
              <Heading size="sm">Total Accounts</Heading>
            </Flex>
          </CardHeader>
          <CardBody className={s.cardBodyTight}>
            <Text>{accounts.length}</Text>
            <Text color="green">↑ {accountsThisWeek} this week</Text>
          </CardBody>
        </Card>

        <Card className={s.card}>
          <CardHeader>
            <Flex gap="4" alignItems="center">
              <AiOutlineDollarCircle size={30} color="orange" />
              <Heading size="sm">Total Balance</Heading>
            </Flex>
          </CardHeader>
          <CardBody className={s.cardBodyTight}>
            <Text>
              {accounts
                .reduce((sum, acc) => sum + acc.availableBalance, 0)
                .toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD"
                })}
            </Text>
          </CardBody>
        </Card>

        <Card className={s.card} opacity={0.6} pointerEvents="none">
          <CardHeader>
            <Flex gap="4" alignItems="center">
              <GoAlert size={30} color="red" />
              <Heading size="sm">Alerts</Heading>
            </Flex>
          </CardHeader>
          <CardBody className={s.cardBodyTight}>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Chart + Activity */}
      <SimpleGrid columns={{ base: 1, lg: 3 }} className={s.section}>
        <GridItem colSpan={{ base: 1, lg: 2 }}>
          <Card className={s.card}>
            <CardBody>
              <Flex className={s.flexBetween} mb={4}>
                <Text fontWeight="bold">User Growth (Last 4 Months)</Text>

                <HStack>
                  <Button size="sm" colorScheme={activeChart === "users" ? "blue" : "gray"} onClick={() => setActiveChart("users")}>
                    Users
                  </Button>

                  <Button size="sm" colorScheme={activeChart === "accounts" ? "blue" : "gray"} onClick={() => setActiveChart("accounts")}>
                    Accounts
                  </Button>
                </HStack>
              </Flex>

              <Box className={s.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3182CE" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3182CE" stopOpacity={0} />
                      </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3182CE"
                      fill="url(#colorUsers)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <RecentActivity activities={activities} />
        </GridItem>
      </SimpleGrid>

      {openCreateAccount && (
        <CreateAccountModal isOpen={openCreateAccount} onClose={() => setOpenCreateAccount(false)} />
      )}

      {openCreateUser && (
        <CreateUserModal isOpen={openCreateUser} onClose={() => setOpenCreateUser(false)} />
      )}
    </Box>
  );
}