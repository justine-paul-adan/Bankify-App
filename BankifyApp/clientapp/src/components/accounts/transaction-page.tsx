import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  Text,
  FormLabel,
  Input,
  Select,
  Heading,
  VStack,
  useToast,
  Card,
  CardBody,
  Divider,
  Flex,
  HStack,
} from "@chakra-ui/react";
import {
  changePin,
  depositMoney,
  getBalance,
  getHistory,
  withdrawMoney,
} from "../../services/transactionService";
import { useAuth } from "../../context/authContext";
import { RequestTransaction, TransactionDto } from "../../models/transaction";

const TransactionPage = () => {
  const { user, isLoading } = useAuth();
  const toast = useToast();

  const [type, setType] = useState("Deposit");
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<TransactionDto[]>([]);
  const [showHistory, setShowHistory] = useState(true);

  const getInitialRequest = (accountNumber: number): RequestTransaction => ({
    accountNumber,
    amount: 0,
    currentPin: "",
    newPin: "",
  });
  const [request, setRequest] = useState<RequestTransaction>(
    getInitialRequest(user?.accountNumber || 0),
  );

  useEffect(() => {
    if (user) {
      setRequest((prev) => ({
        ...prev,
        accountNumber: user.accountNumber,
      }));
    }
  }, [user, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRequest((prev) => ({ ...prev, [name]: value }));
  };

  const fetchHistory = useCallback(async () => {
  try {
    if (!user) return;

    const res = await getHistory(user.accountNumber);
    setHistory(res.data || []);
  } catch (err) {
    console.error(err);
  }
}, [user]);

useEffect(() => {
    console.log("Auth state:", { user, isLoading });

  if (!isLoading && user) {
    fetchHistory();
  }
}, [isLoading, user, fetchHistory]);

  const handleTransaction = async () => {
    if (!user) return;

    try {
      setLoading(true);

      if (type !== "ChangePin" && type !== "Balance" && request.amount < 100) {
        toast({
          title: "Invalid Amount",
          description: "Minimum amount is 100",
          status: "warning",
          duration: 3000,
        });
        return;
      }

      switch (type) {
        case "Deposit":
          await depositMoney(request);
          break;
        case "Withdraw":
          await withdrawMoney(request);
          break;
        case "ChangePin":
          await changePin(request);
          break;
        case "Balance":
          const bal = await getBalance(user.accountNumber, request.currentPin);
          setBalance(bal.data?.amount || null);
          break;
      }

      toast({
        title: "Success",
        description: "Transaction completed successfully",
        status: "success",
        duration: 3000,
      });

      fetchHistory();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.response?.data?.message || "Transaction failed",
        status: "error",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    if (type === "Deposit") return "⬆️";
    if (type === "Withdraw") return "⬇️";
    return "⚠️";
  };

  const getColor = (type: string) => {
    if (type === "Deposit") return "green";
    if (type === "Withdraw") return "red";
    return "yellow";
  };

  return (
    <Box bg="gray.100" minH="100vh" p={6}>
      <Heading mb={6}>🏦 Bankify Transaction Dashboard</Heading>

      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        {/* LEFT PANEL */}
        <Card flex="1" borderRadius="xl" shadow="md">
          <CardBody>
            <Heading size="md" mb={4}>
              Quick Transaction
            </Heading>

            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Transaction Type</FormLabel>
                <Select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="Deposit">Deposit</option>
                  <option value="Withdraw">Withdraw</option>
                  <option value="ChangePin">Change PIN</option>
                  <option value="Balance">Check Balance</option>
                </Select>
              </FormControl>

              {type !== "ChangePin" && type !== "Balance" && (
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <Input
                    name="amount"
                    type="number"
                    value={request.amount}
                    onChange={handleChange}
                    bg="gray.50"
                  />
                </FormControl>
              )}

              <FormControl>
                <FormLabel>PIN</FormLabel>
                <Input
                  name="currentPin"
                  type="password"
                  value={request.currentPin}
                  onChange={handleChange}
                  bg="gray.50"
                />
              </FormControl>

              {type === "ChangePin" && (
                <FormControl>
                  <FormLabel>New PIN</FormLabel>
                  <Input
                    name="newPin"
                    type="password"
                    value={request.newPin}
                    onChange={handleChange}
                    bg="gray.50"
                  />
                </FormControl>
              )}

              <Button
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
                size="lg"
                onClick={handleTransaction}
                isLoading={loading}
              >
                ⚡ Execute Transaction
              </Button>
            </VStack>

            {balance && (
              <Box mt={4} bg="green.500" color="white" p={3} borderRadius="md">
                Balance: ₱{balance}
              </Box>
            )}
          </CardBody>
        </Card>

        {/* RIGHT PANEL */}
        <Card flex="1.5" borderRadius="xl" shadow="md">
          <CardBody>
            <Flex justify="space-between" mb={4}>
              <Heading size="md">Transaction History</Heading>
              <Button size="sm" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? "Hide" : "View"}
              </Button>
            </Flex>

            <Divider mb={4} />

            {showHistory && (
              <VStack spacing={4} align="stretch">
                {history.map((t) => (
                  <Flex
                    key={t.transactionRef}
                    p={3}
                    borderRadius="lg"
                    bg="gray.50"
                    align="center"
                    justify="space-between"
                  >
                    <HStack spacing={3}>
                      <Box
                        bg={`${getColor(t.type)}.100`}
                        color={`${getColor(t.type)}.600`}
                        borderRadius="full"
                        p={2}
                      >
                        {getIcon(t.type)}
                      </Box>

                      <Box>
                        <Text fontWeight="bold">
                          ₱{t.amount} {t.type.toLowerCase()}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          Ref: {t.transactionRef}
                        </Text>
                      </Box>
                    </HStack>

                    <Text fontSize="sm" color="gray.400">
                      {t.createdDate}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            )}
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
};

export default TransactionPage;