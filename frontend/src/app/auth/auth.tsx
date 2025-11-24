/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Title,
  Text,
  Button,
  ThemeIcon,
  Center,
} from "@mantine/core";
import { IconUser } from "@tabler/icons-react";

export const Authentication = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn) {
          setCurrentUser(data.user);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserSession();
  }, [fetchUserSession]);

  if (loading) {
    return (
      <Center className="min-h-screen">
        <Text>Loading authentication...</Text>
      </Center>
    );
  }

  if (!currentUser) {
    return (
      <Center className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/20">
        <Card shadow="lg" radius="lg" p="xl" className="text-center">
          <ThemeIcon size={80} color="blue" variant="light" radius="xl" mb="md">
            <IconUser size={40} />
          </ThemeIcon>
          <Title order={2} mb="sm">Authentication Required</Title>
          <Text c="dimmed" mb="lg">Please log in to continue</Text>
          <Button component="a" href="/login" size="lg">
            Go to Login
          </Button>
        </Card>
      </Center>
    );
  }

  return null; // nothing is shown when logged in
};

// ✅ Exported helper function to check authentication (for other files)
export async function Found() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  try {
    const response = await fetch(`${API_URL}/api/auth/profile`, {
      credentials: "include",
    });
    if (response.ok) {
      const data = await response.json();
      return data.loggedIn ? data.user : null;
    }
  } catch (error) {
    console.error("Error checking session:", error);
  }
  return null;
}
