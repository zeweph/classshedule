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
  Textarea,
  Select,
  Switch,
  Grid,
  Collapse,
  Paper,
  TextInput
} from "@mantine/core";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye, 
  IconEyeOff,
  IconDotsVertical,
  IconAlertCircle,
  IconInfoCircle,
  IconBell,
  IconCalendar,
  IconClock
} from "@tabler/icons-react";
import { DateInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useAppDispatch } from "@/hooks/redux";
import { useAnnouncements } from "@/hooks/useAnnouncement";
import { 
  fetchAnnouncements, 
  createAnnouncement, 
  updateAnnouncement, 
  deleteAnnouncement, 
  togglePublish,
  setCurrentAnnouncement,
  clearCurrentAnnouncement
} from "@/store/slices/announcementsSlice";
import { Authentication, Found } from "@/app/auth/auth";


const AnnouncementsSection = () => {
  const dispatch = useAppDispatch();
  const { announcements, loading, submitting, currentAnnouncement } = useAnnouncements();
  
  const [opened, { open, close }] = useDisclosure(false);
  const [viewOpened, { open: openView, close: closeView }] = useDisclosure(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
   const [formData, setFormData] = useState({
    title: "",
    content: "",
    priority: "medium" as "low" | "medium" | "high",
    publish_at: null as Date | null,
    expires_at: null as Date | null,
    is_published: false
  });

  // Fetch user session and announcements on component mount
  useEffect(() => {
    dispatch(fetchAnnouncements());
  }, [dispatch]);

 
  useEffect(() => {
    if (currentAnnouncement && opened) {
      setFormData({
        title: currentAnnouncement.title,
        content: currentAnnouncement.content,
        priority: currentAnnouncement.priority,
        publish_at: currentAnnouncement.publish_at ? new Date(currentAnnouncement.publish_at) : null,
        expires_at: currentAnnouncement.expires_at ? new Date(currentAnnouncement.expires_at) : null,
        is_published: currentAnnouncement.is_published
      });
    }
  }, [currentAnnouncement, opened]);
 useEffect(() => {
       const checkAuth = async () => {
         const foundUser = await Found();
         setCurrentUser(foundUser);
       };
       checkAuth();
     }, []);
   
     if (currentUser === null) {
       // Not logged in → show authentication page
       return <Authentication />;
     }
  // Reset form function
  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      priority: "medium",
      publish_at: null,
      expires_at: null,
      is_published: false
    });
    dispatch(clearCurrentAnnouncement());
  };

  // Updated handleSubmit function using session
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.title && formData.content) {
        

        // Safe date conversion function
        const safeToISOString = (date: any): string | null => {
          if (!date) return null;
          
          if (date instanceof Date && !isNaN(date.getTime())) {
            return date.toISOString();
          }
          
          if (typeof date === 'string') {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate.toISOString();
            }
          }
          
          return null;
        };

        // Transform form data for API - NO department_id needed (comes from session)
        const apiData = {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          is_published: formData.is_published,
          publish_at: safeToISOString(formData.publish_at),
          expires_at: safeToISOString(formData.expires_at),
          // author_id and department_id will come from session automatically
        };

        console.log('Submitting announcement as:', currentUser.full_name);
        console.log('User department:', currentUser.department_name);

        if (currentAnnouncement) {
          await dispatch(updateAnnouncement({
            id: currentAnnouncement.id,
            data: apiData
          })).unwrap();
        } else {
          await dispatch(createAnnouncement(apiData)).unwrap();
        }
        
        resetForm();
        close();
        
        // Refresh announcements list
        dispatch(fetchAnnouncements());
      }
    } catch (error) {
      console.error("Failed to save announcement:", error);
      alert('Failed to save announcement. Please try again.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      await dispatch(deleteAnnouncement(id));
      dispatch(fetchAnnouncements()); // Refresh list
    }
  };

  const handleTogglePublish = async (id: number) => {
    await dispatch(togglePublish(id));
    dispatch(fetchAnnouncements()); // Refresh list
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

  return (
    <div className="space-y-6">
      {/* Header with user info */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Department Announcements</h2>
          <p className="text-blue-300">
            Welcome, {currentUser.full_name} • {currentUser.department_name}
          </p>
        </div>
        <Button 
          leftSection={<IconPlus size={16} />} 
          onClick={() => {
            resetForm();
            open();
          }}
          className="bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          New Announcement
        </Button>
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
                    <Menu.Item
                      leftSection={announcement.is_published ? 
                        <IconEyeOff size={16} className="text-yellow-400" /> : 
                        <IconEye size={16} className="text-green-400" />
                      }
                      onClick={() => handleTogglePublish(announcement.id)}
                      className="text-slate-200 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      {announcement.is_published ? "Unpublish" : "Publish"}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<IconEdit size={16} className="text-blue-400" />}
                      onClick={() => {
                        dispatch(setCurrentAnnouncement(announcement));
                        open();
                      }}
                      className="text-slate-200 hover:bg-blue-500/20 hover:text-blue-300"
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Divider className="border-slate-700" />
                    <Menu.Item
                      leftSection={<IconTrash size={16} className="text-red-400" />}
                      color="red"
                      onClick={() => handleDelete(announcement.id)}
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal 
        opened={opened} 
        onClose={() => {
          close();
          resetForm();
        }}
        title={
          <Text className="text-xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
            {currentAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <TextInput
            label={
              <Text className="text-blue-300 font-semibold">Title</Text>
            }
            placeholder="Enter announcement title..."
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            classNames={{
              input: "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all",
            }}
            size="md"
          />
          
          <Textarea
            label={
              <Text className="text-blue-300 font-semibold">Content</Text>
            }
            placeholder="Enter announcement content..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
            minRows={5}
            classNames={{
              input: "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all",
            }}
            size="md"
          />
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <Select
                label={
                  <Text className="text-blue-300 font-semibold">Priority Level</Text>
                }
                value={formData.priority}
                onChange={(value) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" })}
                data={[
                  { value: 'low', label: '💙 Low Priority' },
                  { value: 'medium', label: '💎 Medium Priority' },
                  { value: 'high', label: '🚨 High Priority' }
                ]}
                classNames={{
                  input: "bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all",
                  dropdown: "bg-slate-800 border-slate-700",
                  option: "hover:bg-blue-500/20 text-slate-200"
                }}
                size="md"
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <div className="pt-8">
                <Switch
                  label={
                    <Text className="text-blue-300 font-semibold">Publish Immediately</Text>
                  }
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.currentTarget.checked })}
                  classNames={{
                    label: "text-blue-300 cursor-pointer",
                    track: "cursor-pointer bg-slate-600",
                    thumb: formData.is_published ? "bg-blue-500" : "bg-slate-400"
                  }}
                  size="md"
                />
              </div>
            </Grid.Col>
          </Grid>
          
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={
                  <Text className="text-blue-300 font-semibold">Schedule Publish Date</Text>
                }
                value={formData.publish_at}
                onChange={(date) => {
                  let publishAtValue: Date | null = null;
                  if (typeof date === "string") {
                    const parsedDate = new Date(date);
                    publishAtValue = isNaN(parsedDate.getTime()) ? null : parsedDate;
                  } else {
                    publishAtValue = date;
                  }
                  setFormData({ ...formData, publish_at: publishAtValue });
                }}
                placeholder="Select publish date..."
                clearable
                classNames={{
                  input: "bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all",
                }}
                size="md"
                leftSection={<IconCalendar size={16} className="text-blue-400" />}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
              <DateInput
                label={
                  <Text className="text-blue-300 font-semibold">Expiration Date</Text>
                }
                value={formData.expires_at}
                onChange={(date) => {
                  let expiresAtValue: Date | null = null;
                  if (typeof date === "string") {
                    const parsedDate = new Date(date);
                    expiresAtValue = isNaN(parsedDate.getTime()) ? null : parsedDate;
                  } else {
                    expiresAtValue = date;
                  }
                  setFormData({ ...formData, expires_at: expiresAtValue });
                }}
                placeholder="Select expiration date..."
                clearable
                classNames={{
                  input: "bg-slate-700 border-slate-600 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all",
                }}
                size="md"
                leftSection={<IconClock size={16} className="text-blue-400" />}
              />
            </Grid.Col>
          </Grid>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 backdrop-blur-sm">
            <Group gap="sm">
              <IconInfoCircle size={20} className="text-blue-400" />
              <Text size="sm" className="text-blue-300 font-medium">
                {formData.is_published 
                  ? `📢 This announcement will be published immediately and visible to everyone in ${currentUser.department_name}.` 
                  : `💾 This announcement will be saved as a draft for ${currentUser.department_name} and can be published later.`}
              </Text>
            </Group>
          </div>
          
          <Group justify="flex-end" className="pt-6 border-t border-slate-700">
            <Button 
              variant="outline" 
              onClick={() => {
                close();
                resetForm();
              }}
              classNames={{
                root: "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white hover:border-blue-500 transition-all"
              }}
              size="md"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={submitting}
              disabled={!formData.title.trim() || !formData.content.trim()}
              classNames={{
                root: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/25"
              }}
              size="md"
            >
              {currentAnnouncement ? 'Update' : 'Create'} Announcement
            </Button>
          </Group>
        </form>
      </Modal>

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