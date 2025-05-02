import React from "react";
import { IconButton, useChakraContext } from "@chakra-ui/react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useChakraContext();
  const isDark = colorMode === "dark";

  return (
    <IconButton
      aria-label="Toggle theme"
      icon={isDark ? <FaSun /> : <FaMoon />}
      onClick={toggleColorMode}
      variant="ghost"
    />
  );
}
