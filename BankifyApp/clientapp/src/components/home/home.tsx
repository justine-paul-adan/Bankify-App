import {
  Box,
  Container,
  Flex,
  Heading,
  Image,
  Text,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import avatar from "../assets/avatar.png";
import avatar2 from "../assets/avatar2.png";
import avatar3 from "../assets/avatar3.png";

export default function SimpleCarousel() {
  const [index, setIndex] = useState(0);

  const slides = [
    {
      title: "Bank securely on the Bankify Online website or app",
      desc: "Manage your accounts with added security features, anywhere, anytime.",
      image: avatar,
    },
    {
      title: "Experience an improved Bankify Web App",
      desc: "Navigate Bankify's extensive products and services on our improved website interface.",
      image: avatar2,
    },
    {
      title: "Discover the right account for you",
      desc: "Open an account anytime, anywhere. ",
      image: avatar3,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const slide = slides[index];

  return (
    <Box minH="80vh" display="flex" alignItems="center">
      <Container maxW="container.xl">
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={10}
        >
          <Box flex="1">
            <Heading
              fontSize={{ base: "3xl", md: "5xl" }}
              fontWeight="medium"
              color="gray.700"
              mb={4}
              lineHeight="1.2"
            >
              {slide.title}
            </Heading>

            <Text fontSize="lg" color="gray.500" mb={6}>
              {slide.desc}
            </Text>
          </Box>

          <Box flex="1" display="flex" justifyContent="center">
            <Image
              src={slide.image}
              alt="Hero"
              maxH="450px"
              objectFit="contain"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}
