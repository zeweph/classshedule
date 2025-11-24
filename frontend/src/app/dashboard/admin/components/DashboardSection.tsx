/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Authentication,Found } from "@/app/auth/auth";
import { useEffect,useState } from "react";
import {
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  
} from "@heroicons/react/24/outline";
import {
  Container,
  Grid,
  Card,
  Group,
  Text,
  Title,
  Stack,
  Box,
  Badge,
  Button,
  Progress,
  RingProgress,
  Center,
  
} from "@mantine/core";

interface Props {
  setActiveSection: (section: string) => void;
}

const DashboardSection: React.FC<Props> = ({ setActiveSection }) => {
   const [user, setUser] = useState<any>(null);
     useEffect(() => {
       const checkAuth = async () => {
         const foundUser = await Found();
         setUser(foundUser);
       };
       checkAuth();
     }, []);
   
     if (user === null) {
       // Not logged in → show authentication page
       return <Authentication />;
     }
  const stats = [
    {
      key: "manageUsers",
      label: "Users",
      total: 124,
      breakdown: [
        { label: "Active", value: 98, color: "green" },
        { label: "Inactive", value: 26, color: "red" },
      ],
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: "indigo",
      progress: 79, // 98/124 * 100
    },
    {
      key: "manageDepartment",
      label: "Departments",
      total: 8,
      breakdown: [],
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      color: "yellow",
    },
    {
      key: "manageSchedule",
      label: "Schedules",
      total: 12,
      breakdown: [
        { label: "Upcoming", value: 8, color: "blue" },
        { label: "Completed", value: 4, color: "green" },
      ],
      icon: <CalendarDaysIcon className="h-6 w-6" />,
      color: "pink",
      progress: 33, // 4/12 * 100
    },
    {
      key: "roomManagement",
      label: "Rooms",
      total: 25,
      breakdown: [
        { label: "Available", value: 20, color: "green" },
        { label: "In Use", value: 5, color: "orange" },
      ],
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      color: "teal",
      progress: 80, // 20/25 * 100
    },
    {
      key: "academicYears",
      label: "Academic Years",
      total: 3,
      breakdown: [
        { label: "Active", value: 1, color: "green" },
        { label: "Upcoming", value: 2, color: "blue" },
      ],
      icon: <AcademicCapIcon className="h-6 w-6" />,
      color: "violet",
      progress: 33,
    },
    {
      key: "viewFeedback",
      label: "Feedback",
      total: 45,
      breakdown: [
        { label: "Approved", value: 32, color: "green" },
        { label: "Pending", value: 13, color: "yellow" },
      ],
      icon: <CalendarDaysIcon className="h-6 w-6" />,
      color: "grape",
      progress: 71,
    },
  ];


  const getRingProgressValue = (item: typeof stats[0]) => {
    if (item.breakdown.length === 0) return 100;
    const mainValue = item.breakdown[0]?.value || 0;
    return (mainValue / item.total) * 100;
  };

  return (
   <Container size="lg" py="xl">
      <Stack gap="lg">
        {/* Welcome Header */}
               <Card 
                 shadow="md" 
                 padding="lg" 
                 radius="lg" 
                 withBorder
                 className="border-blue-100 bg-gradient-to-br from-blue-50/80 to-cyan-50/80"
               >
                 <Group justify="space-between" wrap="nowrap">
                   <div className="flex-1">
                     <Group>
                       <Title order={1} className="text-blue-800 mb-3 font-bold">
                         🎓 Welcome to Admin Dashboard
                       </Title>
                       
                     </Group>
                     <Text c="dimmed" size="lg" className="max-w-2xl">
                       Manage your academic activities, track progress, and access all department resources in one place.
                     </Text>
                   </div>
                   <Group>
                     <Badge 
                       color="blue" 
                       variant="filled" 
                       size="xl" 
                       radius="sm"
                       className="hidden lg:block"
                     >
                       Academic Year 2024
                     </Badge>
                     <Button
                       variant="light"
                       color="blue"
                       size="sm"
                      
                      //  leftSection={<IconRefresh size={16} />}
                     >
                       Refresh
                     </Button>
                   </Group>
                 </Group>
               </Card>

        {/* Stats Grid */}
        <Grid gutter="lg">
          {stats.map((item) => (
            <Grid.Col key={item.key} span={{ base: 12, sm: 6, lg: 4 }}>
              <Card
                withBorder
                radius="md"
                p="lg"
                className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
                onClick={() => setActiveSection(item.key)}
              >
                <Group justify="space-between" align="flex-start" mb="md">
                  <Box>
                    <Text fw={500} size="sm" c="dimmed" tt="uppercase">
                      {item.label}
                    </Text>
                    <Title order={2} className={`text-${item.color}-600`}>
                      {item.total}
                    </Title>
                  </Box>
                  
                  {/* Icon with colored background */}
                  <Box
                    className={`bg-${item.color}-50 p-3 rounded-full`}
                  >
                    <Box className={`text-${item.color}-600`}>
                      {item.icon}
                    </Box>
                  </Box>
                </Group>

                {/* Progress Ring or Simple Badge */}
                {item.breakdown.length > 0 ? (
                  <Group gap="md" align="flex-start">
                    <RingProgress
                      size={80}
                      thickness={6}
                      roundCaps
                      sections={[
                        { 
                          value: getRingProgressValue(item), 
                          color: item.color 
                        },
                      ]}
                      label={
                        <Center>
                          <Text fw={700} size="xs">
                            {Math.round(getRingProgressValue(item))}%
                          </Text>
                        </Center>
                      }
                    />
                    
                    <Box style={{ flex: 1 }}>
                      <Stack gap="xs">
                        {item.breakdown.map((breakdownItem, idx) => (
                          <Group key={idx} justify="space-between">
                            <Group gap="xs">
                              <Box
                                className={`w-2 h-2 rounded-full bg-${breakdownItem.color}-500`}
                              />
                              <Text size="sm" c="dimmed">
                                {breakdownItem.label}
                              </Text>
                            </Group>
                            <Badge 
                              color={breakdownItem.color} 
                              variant="light"
                              size="sm"
                            >
                              {breakdownItem.value}
                            </Badge>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  </Group>
                ) : (
                  <Badge 
                    color={item.color} 
                    variant="filled" 
                    size="lg"
                    fullWidth
                  >
                    Total: {item.total}
                  </Badge>
                )}

                {/* Progress Bar for some items */}
                {item.progress && (
                  <Box mt="md">
                    <Text size="xs" c="dimmed" mb="xs">
                      Completion
                    </Text>
                    <Progress 
                      value={item.progress} 
                      color={item.color}
                      size="sm"
                      radius="xl"
                    />
                  </Box>
                )}

                {/* Click Hint */}
                <Text size="xs" c="dimmed" mt="md" ta="center">
                  Click to manage {item.label.toLowerCase()}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Quick Stats Summary */}
        <Card withBorder radius="md" p="lg" bg="blue.0">
          <Group justify="space-between">
            <Box>
              <Text fw={600} size="lg">Quick Summary</Text>
              <Text size="sm" c="dimmed">
                {stats.length} management sections available
              </Text>
            </Box>
            <Badge color="blue" size="lg" variant="filled">
              Total Items: {stats.reduce((sum, item) => sum + item.total, 0)}
            </Badge>
          </Group>
        </Card>
      </Stack>
    </Container>
  );
};

export default DashboardSection;