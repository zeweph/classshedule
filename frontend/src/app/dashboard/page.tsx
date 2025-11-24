/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Text,
  Drawer,
  Loader,
  Card,
  Group,
  Button,
} from "@mantine/core";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

import { useEffect, useState } from "react";
import { Found } from "../auth/auth"; 
// Redux
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { setActiveSection, setSidebarOpened } from "@/store/slices/uiSlice";
import { AdminSidebar, renderSection } from "./admin/components/sidebar";
import { DepSidebar, renderSectionOnDepSidbar } from "./department/components/sidebar";
import { InstSidebar, renderSectionOnInst } from "./instructor/components/sidebar";
import { useRouter } from "next/navigation";
import { checkSession } from "@/store/slices/checkSession";
import { StudSidebar , renderSectionOnStud } from "./student/components/sidebar";

const AdminPage = () => {
  const dispatch = useAppDispatch();
  const { activeSection, sidebarOpened } = useAppSelector((state) => state.ui);
  const router = useRouter();
  
  const handleSetActiveSection = (section: string) => {
    dispatch(setActiveSection(section));
  };
    const { session, loading} = useAppSelector((state) => state.auth);
  
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const foundUser = await Found();
        setUser(foundUser);
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      }
    };
    checkAuth();
     dispatch(checkSession());
  }, [dispatch]);
   // Loading State
    if (loading) {
      return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <Loader size="lg" color="blue" />
          <Text c="dimmed" mt="md">
            Loading Dashboard...
          </Text>
        </div>
      );
    }
  // Unauthorized Access
    if (user == null || session?.loggedIn === false) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70 p-4">
          <Card shadow="xl" padding="xl" radius="lg" className="max-w-sm w-full">
            <Group p="center" mb="md">
              <ExclamationCircleIcon className="h-16 w-16 text-red-500" />
            </Group>
            <Text ta="center" fw={700} fz="xl" c="red">
              Unauthorized Access
            </Text>
            <Text ta="center" mt="sm" c="dimmed">
              {!user 
                ? "Please log in to access the admin portal." 
                : "This account is not authorized to access the admin portal."}
            </Text>
            <Button 
              fullWidth 
              color="red" 
              radius="md" 
              mt="lg" 
              onClick={() => router.push("/login")}
            >
              Go to Login
            </Button>
          </Card>
        </div>
      );
    }
    const renderSidebar = () => {
      if (user?.role === "admin") {
      return <AdminSidebar />;
    }
    else if (user?.role === "department_head") {
      return <DepSidebar />;
    }
    else if (user?.role === "instructor") {
      return <InstSidebar />;
    }
    else if (user?.role === "student") {
      return <StudSidebar />
    }
  }
  const renderAllSection = (activeSection: string, handleSetActiveSection: (section: string) => void) => {
    if (user?.role === "admin") {
      return renderSection(activeSection, handleSetActiveSection);
    }
    else if (user?.role === "department_head") {
      return renderSectionOnDepSidbar(activeSection, handleSetActiveSection);
    }
    else if (user?.role === "instructor") {
      return renderSectionOnInst(activeSection, handleSetActiveSection);
    }
    else if (user?.role === "student") {
      return renderSectionOnStud(activeSection, handleSetActiveSection);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* DESKTOP SIDEBAR - Fixed */}
        <aside className="hidden md:flex flex-col w-64 fixed top-0 left-0 h-screen shadow-xl z-30 pt-20">
           {renderSidebar()}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-h-screen md:ml-64">
          <div className="p-4 md:p-6 lg:p-8 pt-4 md:pt-6">
            {/* MOBILE DRAWER */}
            <Drawer
              opened={sidebarOpened}
              onClose={() => dispatch(setSidebarOpened(false))}
              padding="md"
              size="280px"
              title={
                <div className="flex items-center justify-between">
                  <Text fw={700} size="lg">Admin Menu</Text>
                </div>
              }
              overlayProps={{ opacity: 0.5, blur: 2 }}
              zIndex={1000}
              position="left"
            >
             {renderSidebar()}
            </Drawer>

            {/* CONTENT SECTION */}
            <div className="w">
              <div className="rounded-xl shadow-sm border border-gray-200 min-h-[calc(100vh-140px)]">
                {renderAllSection(activeSection, handleSetActiveSection)}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;