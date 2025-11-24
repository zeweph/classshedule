/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";
import {
  Menu,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Skeleton,
  Modal,
  TextInput,
  Button,
  Stack,
  PasswordInput,
  Notification,
  FileInput,
  Divider,
  LoadingOverlay,
  Badge,
  Paper,
} from "@mantine/core";
import {
  IconUser,
  IconSettings,
  IconLock,
  IconLogout,
  IconSun,
  IconMoon,
  IconUserCircle,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCheck,
  IconX,
  IconCamera,
  IconDeviceFloppy,
  IconId,
  IconSchool,
} from "@tabler/icons-react";

import { useMantineColorScheme } from "@mantine/core";
import img from "../../public/images/wdu.jpg";
import { useAppDispatch } from "@/hooks/redux";
import { setSidebarOpened } from "@/store/slices/uiSlice";
import { Found } from "@/app/auth/auth";
import { useRouter } from "next/navigation";
import { logoutUser } from "@/store/slices/checkSession";

interface UserProfile {
  id: number;
  id_number: string;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: string;
  department_id: number;
  department_name: string;
  phone?: string;
  address?: string;
  profile_picture?: string;
}

export default function PostHeader() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
 
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [profileModalOpened, setProfileModalOpened] = useState(false);
  const [passwordModalOpened, setPasswordModalOpened] = useState(false);
  
  // Notification state
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const foundUser = await Found();
        setUser(foundUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);
 
  const handleLogout = async () => {
    const result = await dispatch(logoutUser());
    if (logoutUser.fulfilled.match(result)) {
      router.push("/login");
    }
  };

  // Profile Modal Handlers
  const openProfileModal = () => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      setImagePreview(user.profile_picture || "");
      setProfileImage(null);
    }
    setProfileModalOpened(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpened(false);
    setProfileImage(null);
  };

  // Password Modal Handlers
  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordModalOpened(true);
  };

  const closePasswordModal = () => {
    setPasswordModalOpened(false);
  };

  // Form Handlers
  const handleProfileInputChange = (field: string, value: string) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (file: File | null) => {
    setProfileImage(file);
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Save Profile
  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setSaving(true);
      
      const submitData = new FormData();
      submitData.append('full_name', profileForm.full_name);
      submitData.append('email', profileForm.email);
      submitData.append('phone', profileForm.phone || '');
      submitData.append('address', profileForm.address || '');
      
      if (profileImage) {
        submitData.append('profile_picture', profileImage);
      }

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        body: submitData,
        credentials: 'include',
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        closeProfileModal();
        setNotification({ type: 'success', message: "Profile updated successfully!" });
        
        // Refresh user data
        const foundUser = await Found();
        setUser(foundUser);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  // Change Password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({ type: 'error', message: "New passwords do not match" });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setNotification({ type: 'error', message: "Password must be at least 6 characters long" });
      return;
    }

    try {
      setSaving(true);
      
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (response.ok) {
        setNotification({ type: 'success', message: "Password changed successfully!" });
        closePasswordModal();
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to change password");
      }
    } catch (error: any) {
      setNotification({ type: 'error', message: error.message });
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "student":
        return "blue";
      case "instructor":
        return "violet";
      case "department_head":
        return "orange";
      case "admin":
        return "red";
      default:
        return "gray";
    }
  };

  // Show loading state or fallback while user data is loading
  if (loading) {
    return (
      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between h-20 px-6">
          {/* Loading state for logo */}
          <div className="hidden md:flex items-center space-x-4">
            <Image src={img} alt="Woldia Logo" width={60} height={60} className="rounded-lg" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">WOLDIA UNIVERSITY</h1>
              <p className="text-sm font-semibold text-blue-700">Class Schedule Management System</p>
            </div>
          </div>
          
          {/* Loading state for user menu */}
          <div className="flex items-center space-x-3">
            <Skeleton height={20} width={100} />
            <Skeleton circle height={45} width={45} />
          </div>
        </div>
      </header>
    );
  }

  return (
    <>
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-60 max-w-sm w-full">
          <Notification 
            color={notification.type === 'success' ? 'teal' : 'red'}
            title={notification.type === 'success' ? 'Success' : 'Error'}
            onClose={() => setNotification(null)}
            icon={notification.type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
          >
            {notification.message}
          </Notification>
        </div>
      )}

      <header className="fixed top-0 left-0 w-full z-50 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center justify-between h-20 px-6">
          {/* Mobile Header with Burger Menu */}
          <div className="md:hidden flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <button
              onClick={() => dispatch(setSidebarOpened(true))}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Bars3Icon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          
          {/* LEFT: Logo */}
          <div className="hidden md:flex items-center space-x-4">
            <Image 
              src={img} 
              alt="Woldia Logo" 
              width={60} 
              height={60} 
              className="rounded-lg cursor-pointer"
              onClick={() => router.push("/dashboard")}
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">WOLDIA UNIVERSITY</h1>
              <p className="text-sm font-semibold text-blue-700">Class Schedule Management System</p>
            </div>
          </div>

          {/* RIGHT: User menu */}
          <Menu
            width={260}
            position="bottom-end"
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton className="hover:bg-gray-100 rounded-xl px-3 py-2 transition-colors duration-200">
                <Group>
                  <div className="text-right hidden sm:block">
                    <Text size="sm" fw={600} className="text-gray-800">
                      {user?.full_name || "User"}
                    </Text>
                    <Text size="xs" c="dimmed" className="capitalize">
                      {user?.role || "User"}
                    </Text>
                  </div>
                  <Avatar 
                    radius="xl" 
                    size={45} 
                    src={user?.profile_picture}
                    className="border-2 border-blue-200"
                  >
                    <IconUser size={20} className="text-blue-600" />
                  </Avatar>
                </Group>
              </UnstyledButton>
            </Menu.Target>

            <Menu.Dropdown className="rounded-xl shadow-lg border-0">
              {/* User Info Section */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
                <Group>
                  <Avatar 
                    size={50} 
                    radius="xl" 
                    src={user?.profile_picture}
                    className="border-2 border-white shadow-sm"
                  >
                    <IconUser size={24} className="text-blue-600" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <Text fw={700} size="md" className="text-gray-900 truncate">
                      {user?.full_name || "User"}
                    </Text>
                    <Text size="sm" c="dimmed" className="truncate">
                      {user?.email || "No email"}
                    </Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge color={getRoleColor(user?.role || '')} size="xs">
                        {user?.role}
                      </Badge>
                      <div className={`w-2 h-2 rounded-full ${
                        user?.status === 'active' ? 'bg-green-500' : 
                        user?.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                    </div>
                  </div>
                </Group>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Menu.Item 
                  leftSection={<IconUserCircle size={18} className="text-blue-600" />}
                  onClick={openProfileModal}
                  className="rounded-lg mb-1 hover:bg-blue-50 transition-colors"
                >
                  Update Profile
                </Menu.Item>
                
                <Menu.Item 
                  leftSection={<IconLock size={18} className="text-green-600" />}
                  onClick={openPasswordModal}
                  className="rounded-lg mb-1 hover:bg-green-50 transition-colors"
                >
                  Change Password
                </Menu.Item>
                
                <Menu.Item 
                  leftSection={<IconSettings size={18} className="text-orange-600" />}
                  onClick={() => router.push("/settings")}
                  className="rounded-lg mb-1 hover:bg-orange-50 transition-colors"
                >
                  Settings
                </Menu.Item>

                <div className="mx-2 my-1">
                  <Divider />
                </div>

                <Menu.Item
                  leftSection={colorScheme === "light" ? 
                    <IconSun size={18} className="text-yellow-600" /> : 
                    <IconMoon size={18} className="text-indigo-600" />
                  }
                  onClick={() => toggleColorScheme()}
                  className="rounded-lg mb-1 hover:bg-gray-50 transition-colors"
                >
                  {colorScheme === "light" ? "Dark Mode" : "Light Mode"}
                </Menu.Item>

                <div className="mx-2 my-1">
                  <Divider />
                </div>

                <Menu.Item 
                  leftSection={<IconLogout size={18} className="text-red-600" />}
                  onClick={handleLogout} 
                  className="rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </Menu.Item>
              </div>
            </Menu.Dropdown>
          </Menu>
        </div>
      </header>

      {/* Edit Profile Modal */}
      <Modal
        opened={profileModalOpened}
        onClose={closeProfileModal}
        title="Update Profile"
        size="lg"
        radius="lg"
        overlayProps={{ blur: 3 }}
      >
        <LoadingOverlay visible={saving} overlayProps={{ blur: 2 }} />
        
        <Stack gap="lg">
          {/* Profile Picture Section */}
          <Group justify="center">
            <div className="relative">
              <Avatar 
                src={imagePreview} 
                size={120} 
                radius="xl"
                className="border-4 border-blue-100 shadow-lg"
              >
                <IconUser size={48} className="text-blue-400" />
              </Avatar>
              <FileInput
                accept="image/*"
                onChange={handleImageChange}
                className="absolute bottom-0 right-0"
                size="xs"
              >
                <Button 
                  variant="filled" 
                  color="blue" 
                  size="sm" 
                  radius="xl"
                  leftSection={<IconCamera size={16} />}
                >
                  Change
                </Button>
              </FileInput>
            </div>
          </Group>

          {/* Read-only Information */}
          <Paper p="md" className="bg-gray-50 border">
            <Group grow>
              <TextInput
                label="ID Number"
                value={user?.id_number || ""}
                leftSection={<IconId size={18} />}
                disabled
              />
              <TextInput
                label="Role"
                value={user?.role || ""}
                leftSection={<IconUser size={18} />}
                disabled
              />
            </Group>
            {user?.department_name && (
              <TextInput
                label="Department"
                value={user.department_name}
                leftSection={<IconSchool size={18} />}
                disabled
                className="mt-3"
              />
            )}
          </Paper>

          {/* Editable Information */}
          <TextInput
            label="Full Name"
            value={profileForm.full_name}
            onChange={(e) => handleProfileInputChange('full_name', e.target.value)}
            leftSection={<IconUser size={18} />}
            required
            placeholder="Enter your full name"
          />

          <TextInput
            label="Email Address"
            value={profileForm.email}
            onChange={(e) => handleProfileInputChange('email', e.target.value)}
            leftSection={<IconMail size={18} />}
            required
            type="email"
            placeholder="Enter your email address"
          />

          <TextInput
            label="Phone Number"
            value={profileForm.phone}
            onChange={(e) => handleProfileInputChange('phone', e.target.value)}
            leftSection={<IconPhone size={18} />}
            placeholder="Enter your phone number"
          />

          <TextInput
            label="Address"
            value={profileForm.address}
            onChange={(e) => handleProfileInputChange('address', e.target.value)}
            leftSection={<IconMapPin size={18} />}
            placeholder="Enter your address"
          />

          {/* Action Buttons */}
          <Group justify="right" className="mt-6">
            <Button 
              variant="outline" 
              onClick={closeProfileModal}
              leftSection={<IconX size={18} />}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveProfile}
              loading={saving}
              leftSection={<IconDeviceFloppy size={18} />}
              disabled={!profileForm.full_name || !profileForm.email}
            >
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        opened={passwordModalOpened}
        onClose={closePasswordModal}
        title="Change Password"
        size="md"
        radius="lg"
        overlayProps={{ blur: 3 }}
      >
        <LoadingOverlay visible={saving} overlayProps={{ blur: 2 }} />
        
        <Stack gap="md">
          <PasswordInput
            label="Current Password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
            leftSection={<IconLock size={18} />}
            required
            placeholder="Enter your current password"
          />
          
          <PasswordInput
            label="New Password"
            value={passwordForm.newPassword}
            onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
            leftSection={<IconLock size={18} />}
            required
            placeholder="Enter your new password"
            description="Password must be at least 6 characters long"
          />
          
          <PasswordInput
            label="Confirm New Password"
            value={passwordForm.confirmPassword}
            onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
            leftSection={<IconLock size={18} />}
            required
            placeholder="Confirm your new password"
          />
          
          <Group justify="right" className="mt-6">
            <Button variant="outline" onClick={closePasswordModal}>
              Cancel
            </Button>
            <Button 
              onClick={handleChangePassword}
              loading={saving}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
            >
              Change Password
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}