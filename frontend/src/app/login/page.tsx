"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Container,
  Card,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Group,
  Alert,
  Stack,
  Divider,
  ThemeIcon,
  Badge,
  Grid,
  Loader,
  Progress,
  Modal,
  Anchor,
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconLogin,
  IconCheck,
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconLock,
  IconUser,
  IconShield,
  IconClock,
  IconMail,
  IconKey,
  IconArrowRight,
} from "@tabler/icons-react";

// Redux Imports
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  loginUser, 
  clearError, 
  clearLoading,
  selectAuthLoading,
  selectAuthError,
  selectIsRateLimited,
  selectLoginAttempts,
  resetLoginAttempts 
} from "@/store/slices/authSlice";

// Component Imports
import Header from "@/compnent/header";

// --- Form Validation Schema ---
const validateLoginForm = {
  email: (value: string) => {
    if (!value) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(value)) return "Email address is invalid.";
    return null;
  },
  password: (value: string) => {
    if (!value) return "Password is required.";
    if (value.length < 5) return "Password must be at least 5 characters long.";
    return null;
  },
};

// --- Forgot Password Modal Component ---
const ForgotPasswordModal = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  
  const form = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => !value ? "Email is required." : null,
    },
  });

  const handleSubmit = async (values: { email: string }) => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    notifications.show({
      title: "Reset Link Sent!",
      message: `Password reset instructions sent to ${values.email}`,
      color: "green",
      icon: <IconCheck size={20} />,
    });
    
    setLoading(false);
    onClose();
    form.reset();
  };

  return (
    <Modal 
      opened={opened} 
      onClose={onClose}
      title={
        <Group gap="sm">
          <ThemeIcon color="blue" variant="light" radius="xl">
            <IconKey size={18} />
          </ThemeIcon>
          <Text fw={700} size="xl">Reset Your Password</Text>
        </Group>
      }
      centered
      radius="lg"
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          <Text c="dimmed" size="sm">
            Enter your university email address and we&apos;ll send you instructions to reset your password.
          </Text>
          
          <TextInput
            label="University Email"
            placeholder="your.email@woldia.edu.et"
            leftSection={<IconMail size={20} className="text-blue-500" />}
            size="md"
            radius="lg"
            styles={{
              input: {
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: '#3b82f6',
                  boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                },
              }
            }}
            {...form.getInputProps('email')}
          />
          
          <Group justify="space-between" mt="md">
            <Button variant="light" color="gray" onClick={onClose} radius="lg">
              Cancel
            </Button>
            <Button 
              type="submit"
              loading={loading}
              rightSection={<IconArrowRight size={18} />}
              radius="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Send Reset Link
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

// --- Login Page Component ---
const LoginPage = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Use selectors for better performance
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const isRateLimited = useAppSelector(selectIsRateLimited);
  const loginAttempts = useAppSelector(selectLoginAttempts);
  
  const [redirectProgress, setRedirectProgress] = React.useState(0);
  const [localLoading, setLocalLoading] = React.useState(false);
  const [forgotPasswordOpened, setForgotPasswordOpened] = React.useState(false);

  const isLoading = localLoading || loading;

  // Form handling with Mantine useForm
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: validateLoginForm,
  });

  // Handle form submission with proper loading management
  const handleSubmit = async (values: typeof form.values) => {
    if (isRateLimited) {
      notifications.show({
        title: "Too Many Attempts",
        message: "Please wait 1 minute before trying again.",
        color: "orange",
        icon: <IconClock size={20} />,
      });
      return;
    }

    setLocalLoading(true);
    
    try {
      const result = await dispatch(loginUser(values));
      
      if (loginUser.fulfilled.match(result)) {
        const user = result.payload.user;
        
        if (user?.status === "Active") {
          notifications.show({
            title: "🎉 Welcome Back!",
            message: "Taking you to your dashboard...",
            color: "teal",
            icon: <IconCheck size={20} />,
            withBorder: true,
            radius: "md",
          });

          // Show redirect progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            setRedirectProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              setLocalLoading(false);
              
              const redirectPath = "/dashboard";
              router.push(redirectPath);
            }
          }, 200);
        } else {
          notifications.show({
            title: "Account Not Active",
            message: "Your account has been deactivated. Please contact administrator.",
            color: "orange",
            icon: <IconAlertCircle size={20} />,
            withBorder: true,
          });
          setLocalLoading(false);
        }
      } else if (loginUser.rejected.match(result)) {
        setLocalLoading(false);
      }
    } catch (err) {
      console.error("Login error:", err);
      setLocalLoading(false);
    }
  };

  // Clear states when component unmounts
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Safety timeout for loading state
  React.useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        dispatch(clearLoading());
        setLocalLoading(false);
        notifications.show({
          title: "Request Timeout",
          message: "Login request took too long. Please try again.",
          color: "orange",
        });
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [loading, dispatch]);

  // Reset rate limiting after 1 minute
  React.useEffect(() => {
    if (loginAttempts >= 5) {
      const timeout = setTimeout(() => {
        dispatch(resetLoginAttempts());
      }, 60000);

      return () => clearTimeout(timeout);
    }
  }, [loginAttempts, dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute top-10 left-10 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-10 right-10 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-10 left-20 w-80 h-80 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-6000"></div>
      
      <Header isActive="/login"/>
      
      <Container size="xl" className="py-8 relative z-10">
        <Grid gutter="xl" align="center">
          {/* Left Side - Enhanced Login Form */}
          <Grid.Col  className="flex justify-center">
            <Card 
              shadow="xl" 
              radius="xl" 
              padding="xl"
              className="bg-white/90 backdrop-blur-lg border border-white/20 relative overflow-hidden transform transition-all duration-500 hover:shadow-2xl"
            >
              {/* Subtle background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent pointer-events-none"></div>
              
              {/* Header Section */}
              <Stack align="center" gap="md" mb="xl" className="relative">
                <div className="relative">
                  <ThemeIcon size={90} radius="xl" variant="gradient" gradient={{ from: 'blue', to: 'purple' }} className="shadow-lg">
                    <IconLogin size={44} />
                  </ThemeIcon>
                  <div className="absolute -inset-2 bg-blue-500/20 rounded-full blur-md animate-pulse"></div>
                </div>
                
                <Stack gap="xs" align="center">
                  <Title order={1} className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent text-center">
                    Welcome to Woldia University
                  </Title>
                  <Text c="dimmed" ta="center" size="xl" fw={500}>
                    Sign in to your academic portal
                  </Text>
                  <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} size="lg">
                    Secure Academic Access
                  </Badge>
                </Stack>
              </Stack>

              {/* Rate Limiting Alert */}
              {isRateLimited && (
                <Alert 
                  color="orange" 
                  title="Temporary Access Restriction" 
                  icon={<IconClock size={20} />}
                  mb="md"
                  radius="lg"
                  variant="light"
                >
                  <Text size="sm">
                    For security, please wait 1 minute before your next attempt.
                    {loginAttempts > 0 && ` (${loginAttempts}/5 attempts used)`}
                  </Text>
                </Alert>
              )}

              {/* Redirect Progress Bar */}
              {redirectProgress > 0 && redirectProgress < 100 && (
                <Progress 
                  value={redirectProgress} 
                  size="lg" 
                  color="teal" 
                  animated 
                  className="mb-6 shadow-inner"
                  radius="xl"
                />
              )}

              {/* Error Alert */}
              {error && (
                <Alert 
                  color="red" 
                  title="Authentication Required" 
                  icon={<IconAlertCircle size={20} />}
                  mb="md"
                  withCloseButton
                  onClose={() => dispatch(clearError())}
                  radius="lg"
                  variant="light"
                >
                  <Text size="sm" fw={500}>
                    {error}
                  </Text>
                </Alert>
              )}

              {/* Enhanced Login Form */}
              <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack gap="xl">
                  {/* Email Input */}
                  <TextInput
                    label={
                      <Text fw={600} size="md" className="text-gray-800 mb-2">
                         Email
                      </Text>
                    }
                    placeholder="youremail@gmail.com"
                    leftSection={<IconUser size={22} className="text-blue-500" />}
                    size="lg"
                    radius="lg"
                    disabled={isLoading || isRateLimited}
                    styles={{
                      input: {
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                        height: '56px',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(243, 244, 246, 0.8)',
                        }
                      }
                    }}
                    {...form.getInputProps('email')}
                  />

                  {/* Password Input */}
                  <PasswordInput
                    label={
                      <Text fw={600} size="md" className="text-gray-800 mb-2">
                        Password
                      </Text>
                    }
                    placeholder="Enter your secure password"
                    leftSection={<IconLock size={22} className="text-blue-500" />}
                    size="lg"
                    radius="lg"
                    disabled={isLoading || isRateLimited}
                    visibilityToggleIcon={({ reveal }) =>
                      reveal ? <IconEyeOff size={20} /> : <IconEye size={20} />
                    }
                    styles={{
                      input: {
                        border: '2px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        fontSize: '16px',
                        height: '56px',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                          transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                          backgroundColor: 'rgba(243, 244, 246, 0.8)',
                        }
                      }
                    }}
                    {...form.getInputProps('password')}
                  />

                  {/* Forgot Password Link */}
                  <Box ta="right">
                    <Anchor 
                      component="button" 
                      type="button" 
                      c="blue" 
                      fw={600} 
                      size="sm"
                      onClick={() => setForgotPasswordOpened(true)}
                      className="hover:underline transition-all duration-200"
                    >
                      Forgot your password?
                    </Anchor>
                  </Box>

                  {/* Enhanced Submit Button */}
                  <Button
                    type="submit"
                    size="xl"
                    radius="lg"
                    leftSection={!isLoading && <IconLogin size={24} />}
                    rightSection={isLoading && <Loader size="sm" color="white" />}
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading || isRateLimited}
                    className="h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl shadow-lg"
                    styles={{
                      root: {
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '18px',
                        letterSpacing: '0.5px',
                      }
                    }}
                  >
                    {isRateLimited ? "Temporarily Locked" : isLoading ? "Accessing Your Portal..." : "Access My Portal"}
                  </Button>

                  {/* Security Status */}
                  {loginAttempts > 0 && !isRateLimited && (
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <Text size="sm" c="blue" fw={500}>
                        🔒 Security Notice: {loginAttempts} attempt{loginAttempts !== 1 ? 's' : ''} used (5 max)
                      </Text>
                    </div>
                  )}
                </Stack>
              </form>

              {/* Enhanced Security Information */}
              <Divider my="xl" label="Your Security is Our Priority" labelPosition="center" />
              <Stack gap="md" align="center">
                <Group gap="lg">
                  <Group gap="xs">
                    <ThemeIcon size="md" color="green" variant="light" radius="xl">
                      <IconShield size={18} />
                    </ThemeIcon>
                    <Text size="sm" fw={500} c="dimmed">
                      End-to-End Encryption
                    </Text>
                  </Group>
                  <Group gap="xs">
                    <ThemeIcon size="md" color="blue" variant="light" radius="xl">
                      <IconClock size={18} />
                    </ThemeIcon>
                    <Text size="sm" fw={500} c="dimmed">
                      Rate Limiting Protection
                    </Text>
                  </Group>
                </Group>
                <Text size="xs" c="dimmed" ta="center">
                  Protected by Woldia University&apos;s advanced security infrastructure
                </Text>
              </Stack>
            </Card>
          </Grid.Col>

        </Grid>
      </Container>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal 
        opened={forgotPasswordOpened} 
        onClose={() => setForgotPasswordOpened(false)} 
      />

      {/* Enhanced Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animation-delay-6000 {
          animation-delay: 6s;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;