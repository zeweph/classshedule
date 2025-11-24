/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { 
  Card, 
  Text, 
  Group, 
  Badge, 
  ActionIcon, 
  Menu, 
  Modal,
  Button,
  Grid,
  Collapse,
  Paper} from "@mantine/core";
import { 
  IconEdit, 
  IconEye, 
  IconDotsVertical,
  IconAlertCircle,
  IconInfoCircle,
  IconBell,
  IconCalendar,
  IconClock
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { useAppDispatch } from "@/hooks/redux";
import { useAnnouncements } from "@/hooks/useAnnouncement";
import { 
  fetchAnnouncements, 
  setCurrentAnnouncement,
  clearCurrentAnnouncement
} from "@/store/slices/announcementsSlice";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const AnnouncementsSection = () => {
  const dispatch = useAppDispatch();
  const { announcements, loading, currentAnnouncement } = useAnnouncements();
  
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  
  // Fetch user session and announcements on component mount
  useEffect(() => {
    fetchUserSession();
    dispatch(fetchAnnouncements());
  }, [dispatch]);

  // Fetch current user session
  const fetchUserSession = async () => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        credentials: 'include', // Important for session cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.loggedIn) {
          setCurrentUser(data.user);
          console.log('Current user session:', data.user);
        } else {
          console.log('No user session found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "red";
      case "medium": return "blue";
      case "low": return "indigo";
      default: return "gray";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high": return <IconAlertCircle size={16} />;
      case "medium": return <IconBell size={16} />;
      case "low": return <IconInfoCircle size={16} />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isRecent = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1; // Within 24 hours
  };

  // Show login prompt if no user
  if (!currentUser) {
    return (
      <Paper className="p-8 text-center bg-slate-800 border border-slate-700 rounded-lg">
        <IconBell size={48} className="mx-auto text-blue-400 mb-4" />
        <Text className="text-blue-200 text-lg mb-2">Authentication Required</Text>
        <Text className="text-blue-300 text-sm mb-4">
          Please log in to view and create announcements
        </Text>
        <Button 
          component="a" 
          href="/login" 
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Login
        </Button>
      </Paper>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with user info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-blue">Department Announcements</h2>
          <p className="text-blue-300">
            Welcome, {currentUser.full_name} • {currentUser.department_name}
          </p>
        </div>
       
      </div>

      {/* Announcements Grid */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-slate-800 animate-pulse border border-slate-700">
              <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/2"></div>
            </Card>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <Paper className="p-8 text-center bg-slate-800 border border-slate-700 rounded-lg">
          <IconBell size={48} className="mx-auto text-blue-400 mb-4" />
          <Text className="text-blue-200 text-lg mb-2">No announcements yet</Text>
          <Text className="text-blue-300 text-sm">
            Create the first announcement for {currentUser.department_name}
          </Text>
        </Paper>
      ) : (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card 
              key={announcement.id} 
              className="bg-slate-800 border border-slate-700 hover:border-blue-500/50 transition-all duration-300 rounded-lg shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Group className="mb-3">
                    <Badge 
                      color={getPriorityColor(announcement.priority)}
                      leftSection={getPriorityIcon(announcement.priority)}
                      variant="light"
                      size="md"
                    >
                      {announcement.priority}
                    </Badge>
                    {!announcement.is_published && (
                      <Badge color="gray" variant="outline" size="md">Draft</Badge>
                    )}
                    {announcement.expires_at && new Date(announcement.expires_at) < new Date() && (
                      <Badge color="red" variant="light" size="md">Expired</Badge>
                    )}
                    {isRecent(announcement.created_at) && (
                      <Badge color="green" variant="light" size="md">New</Badge>
                    )}
                  </Group>
                  
                  <Text className="text-white font-semibold text-lg mb-2 hover:text-blue-300 transition-colors">
                    {announcement.title}
                  </Text>
                  
                  <Collapse in={expandedId === announcement.id}>
                    <Text className="text-slate-300 mb-3 whitespace-pre-wrap leading-relaxed">
                      {announcement.content}
                    </Text>
                  </Collapse>
                  
                  <Text 
                    className="text-blue-400 text-sm cursor-pointer hover:text-blue-300 mb-3 font-medium transition-colors"
                    onClick={() => setExpandedId(expandedId === announcement.id ? null : announcement.id)}
                  >
                    {expandedId === announcement.id ? "▲ Show less" : "▼ Read more"}
                  </Text>
                  
                  <Group className="text-xs text-slate-400">
                    <Group gap={4}>
                      <IconCalendar size={12} />
                      <Text>{formatDate(announcement.created_at)}</Text>
                    </Group>
                    {announcement.expires_at && (
                      <Group gap={4}>
                        <Text>•</Text>
                        <IconClock size={12} />
                        <Text className={new Date(announcement.expires_at) < new Date() ? 'text-red-400' : 'text-blue-400'}>
                          Expires {formatDateShort(announcement.expires_at)}
                        </Text>
                      </Group>
                    )}
                    <Group gap={4}>
                      <Text>•</Text>
                      <Text className="text-blue-300">By {announcement.author_name}</Text>
                    </Group>
                    {announcement.department_name && (
                      <Group gap={4}>
                        <Text>•</Text>
                        <Text className="text-green-400">{announcement.department_name}</Text>
                      </Group>
                    )}
                  </Group>
                </div>
                
                <Menu position="bottom-end" shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon 
                      variant="subtle" 
                      color="blue" 
                      className="hover:bg-blue-500/20 transition-colors"
                    >
                      <IconDotsVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown className="bg-slate-800 border border-slate-700">
                    <Menu.Item
                      leftSection={<IconEye size={16} className="text-blue-400" />}
                      onClick={() => {
                        dispatch(setCurrentAnnouncement(announcement));
                        openView();
                      }}
                      className="text-slate-200 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      View Details
                    </Menu.Item>
                   </Menu.Dropdown>
                </Menu>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* View Announcement Modal */}
      <Modal 
        opened={viewOpened} 
        onClose={() => {
          closeView();
          dispatch(clearCurrentAnnouncement());
        }}
        title={
          <Text className="text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            Announcement Details
          </Text>
        }
        size="lg"
        classNames={{
          root: "z-50",
          overlay: "bg-black/60 backdrop-blur-sm",
          content: "bg-slate-800 border border-blue-500/30 rounded-xl shadow-2xl",
          header: "bg-slate-800 border-b border-slate-700",
          body: "bg-slate-800 p-6"
        }}
      >
        {currentAnnouncement && (
          <div className="space-y-6">
            {/* Header with priority and status */}
            <Group justify="apart" align="flex-start">
              <Group>
                <Badge 
                  color={getPriorityColor(currentAnnouncement.priority)}
                  size="lg"
                  leftSection={getPriorityIcon(currentAnnouncement.priority)}
                  variant="light"
                >
                  {currentAnnouncement.priority.toUpperCase()} PRIORITY
                </Badge>
                <Badge 
                  color={currentAnnouncement.is_published ? "blue" : "gray"} 
                  variant="light"
                  size="lg"
                >
                  {currentAnnouncement.is_published ? "📢 Published" : "📝 Draft"}
                </Badge>
              </Group>
              
              {currentAnnouncement.expires_at && new Date(currentAnnouncement.expires_at) < new Date() && (
                <Badge color="red" variant="light" size="lg">
                  ⏰ Expired
                </Badge>
              )}
            </Group>

            {/* Title */}
            <Text className="text-2xl font-bold text-white mt-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {currentAnnouncement.title}
            </Text>

            {/* Content */}
            <Paper className="bg-slate-700/50 p-6 rounded-xl border border-slate-600 backdrop-blur-sm">
              <Text className="text-slate-200 whitespace-pre-wrap leading-relaxed text-lg">
                {currentAnnouncement.content}
              </Text>
            </Paper>

            {/* Metadata */}
            <Paper className="bg-slate-700/30 p-6 rounded-xl border border-slate-600 backdrop-blur-sm">
              <Grid>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text className="text-sm text-blue-300 font-semibold mb-1">Author</Text>
                  <Text className="text-white font-bold text-lg">{currentAnnouncement.author_name}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text className="text-sm text-blue-300 font-semibold mb-1">Department</Text>
                  <Text className="text-white font-bold text-lg">{currentAnnouncement.department_name}</Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text className="text-sm text-blue-300 font-semibold mb-1">Created</Text>
                  <Group gap={4}>
                    <IconCalendar size={14} className="text-blue-400" />
                    <Text className="text-white font-semibold">{formatDate(currentAnnouncement.created_at)}</Text>
                  </Group>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Text className="text-sm text-blue-300 font-semibold mb-1">Last Updated</Text>
                  <Group gap={4}>
                    <IconCalendar size={14} className="text-blue-400" />
                    <Text className="text-white font-semibold">{formatDate(currentAnnouncement.updated_at)}</Text>
                  </Group>
                </Grid.Col>
                {currentAnnouncement.publish_at && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text className="text-sm text-blue-300 font-semibold mb-1">Scheduled For</Text>
                    <Group gap={4}>
                      <IconClock size={14} className="text-blue-400" />
                      <Text className="text-white font-semibold">{formatDate(currentAnnouncement.publish_at)}</Text>
                    </Group>
                  </Grid.Col>
                )}
                {currentAnnouncement.expires_at && (
                  <Grid.Col span={{ base: 12, sm: 6 }}>
                    <Text className="text-sm text-blue-300 font-semibold mb-1">Expires</Text>
                    <Group gap={4}>
                      <IconClock size={14} className="text-blue-400" />
                      <Text className={`font-semibold text-lg ${
                        new Date(currentAnnouncement.expires_at) < new Date() 
                          ? 'text-red-400' 
                          : 'text-green-400'
                      }`}>
                        {formatDate(currentAnnouncement.expires_at)}
                      </Text>
                    </Group>
                  </Grid.Col>
                )}
              </Grid>
            </Paper>

            {/* Action Buttons */}
            <Group justify="flex-end" className="pt-6 border-t border-slate-700">
              <Button 
                variant="outline" 
                onClick={() => {
                  closeView();
                  dispatch(clearCurrentAnnouncement());
                }}
                classNames={{
                  root: "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-blue-500 transition-all"
                }}
                size="md"
              >
                Close
              </Button>
              <Button 
                leftSection={<IconEdit size={16} />}
                onClick={() => {
                  closeView();
                  open();
                }}
                classNames={{
                  root: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
                }}
                size="md"
              >
                Edit Announcement
              </Button>
            </Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsSection;