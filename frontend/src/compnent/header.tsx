
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import img from "../../public/images/wdu.jpg";
import {
  Container,
  Group,
  Burger,
  Drawer,
  ScrollArea,
  Button,
  Divider,
  Text,
  Avatar,
} from "@mantine/core";
import {
  HomeIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
  EyeIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeSolid,
  InformationCircleIcon as InformationCircleSolid,
} from "@heroicons/react/24/solid";

interface HeaderProps {
  isActive?: string; // Make it optional with ?
}

const Header = ({ isActive = "/" }: HeaderProps) => {
  const [opened, setOpened] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState(isActive); // Initialize with prop

  const toggleMenu = () => setOpened((o) => !o);

  useEffect(() => {
    // Update activeLink when isActive prop changes
    setActiveLink(isActive);
  }, [isActive]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home", icon: HomeIcon, activeIcon: HomeSolid },
    { href: "/about", label: "About Us", icon: InformationCircleIcon, activeIcon: InformationCircleSolid },
    { href: "/view", label: "View Schedule", icon: EyeIcon , activeIcon: EyeIcon },
    { href: "/login", label: "Login", icon: ArrowRightOnRectangleIcon , activeIcon: ArrowRightOnRectangleIcon },
    { href: "/help", label: "Help", icon: QuestionMarkCircleIcon , activeIcon: QuestionMarkCircleIcon },
  ];

  const getIcon = (link: any) => {
    if (activeLink === link.href && link.activeIcon) {
      return link.activeIcon;
    }
    return link.icon;
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/95 backdrop-blur-md shadow-xl border-b border-blue-100" 
            : "bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700"
        }`}
      >
        <Container size="xl" className="py-3">
          <div className="flex items-center justify-between">
            {/* Logo & Title Section - Always on Left */}
            <Link 
              href="/" 
              className="flex items-center gap-3 group flex-1 md:flex-none"
              onClick={() => setActiveLink("/")}
            >
              <div className="relative">
                <Image
                  src={img}
                  alt="Woldia University Logo"
                  width={60}
                  height={60}
                  className={`rounded-xl transition-all duration-300 ${
                    scrolled 
                      ? "shadow-md border-2 border-blue-200" 
                      : "shadow-lg border-2 border-white/20"
                  } group-hover:scale-105 group-hover:rotate-3`}
                />
                <div className={`absolute -inset-1 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ${scrolled ? "blur-sm" : "blur"}`}></div>
              </div>
              
              <div className="flex flex-col">
                <Text 
                  fw={800} 
                  size="xl" 
                  className={`transition-colors duration-300 ${
                    scrolled ? "text-blue-800" : "text-white"
                  } leading-tight`}
                >
                  WOLDIA UNIVERSITY
                </Text>


<Text 
                  size="xs" 
                  className={`transition-colors duration-300 ${
                    scrolled ? "text-blue-600" : "text-blue-100"
                  } font-semibold tracking-wide`}
                >
                  SCHEDULE MANAGEMENT SYSTEM
                </Text>
              </div>
            </Link>

            {/* Navigation Buttons (Desktop) - Always on Right */}
            <Group visibleFrom="md" className="gap-1">
              {links.map((link) => {
                const IconComponent = getIcon(link);
                const isLinkActive = activeLink === link.href;
                
                return (
                  <Link href={link.href} key={link.label} onClick={() => setActiveLink(link.href)}>
                    <Button
                      leftSection={<IconComponent className={`h-4 w-4 ${isLinkActive ? "text-blue-600" : ""}`} />}
                      variant={isLinkActive ? "filled" : "subtle"}
                      color={scrolled ? "blue" : isLinkActive ? "gray" : "white"}
                      className={
                       `transition-all duration-200 font-semibold
                        ${scrolled 
                          ? isLinkActive 
                            ? "bg-blue-100 text-blue-700 shadow-sm" 
                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-600" 
                          : isLinkActive
                            ? "bg-white/20 text-white shadow-md"
                            : "text-white/90 hover:bg-white/10 hover:text-white"
                        }
                        rounded-lg px-4 py-2
                      `}
                    >
                      {link.label}
                    </Button>
                  </Link>
                );
              })}
            </Group>

            {/* Mobile Menu Button - Always on Right */}
            <div className="md:hidden flex items-center gap-2">
              <Burger 
                opened={opened} 
                onClick={toggleMenu} 
                color={scrolled ? "blue" : "white"}
                size="md"
                className="transition-colors duration-300"
              />
            </div>
          </div>
        </Container>

        {/* Progress Bar */}
        {scrolled && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-pulse"></div>
        )}
      </header>

      {/* Spacer for fixed header */}
      <div className="h-20"></div>

      {/* Enhanced Drawer Menu (Mobile View) */}
      <Drawer
        opened={opened}
        onClose={toggleMenu}
        padding="md"
        size="85%"
        position="right"
        title={
          <div className="flex items-center gap-3">
            <Avatar 
              src={img.src} 
              size="lg" 
              radius="md"
              className="border-2 border-blue-200"
            />
            <div>
              <Text fw={700} className="text-blue-800">
                Woldia University
              </Text>
              <Text size="sm" className="text-gray-600">
                Schedule System
              </Text>
            </div>
          </div>
        }
        overlayProps={{ opacity: 0.5, blur: 4 }}
        styles={{
          content: {
            borderRadius: '20px 0 0 20px',
          },
          header: {
            borderBottom: '1px solid #e2e8f0',
            paddingBottom: '1rem',
          }
        }}
      >
        <ScrollArea style={{ height: "calc(100vh - 120px)" }} className="pr-4">
          <div className="space-y-2">
            {links.map((link) => {
              const IconComponent = getIcon(link);
              const isLinkActive = activeLink === link.href;


return (
                <Button
                  key={link.label}
                  component={Link}
                  href={link.href}
                  fullWidth
                  justify="start"
                  size="lg"
                  leftSection={<IconComponent className={`h-5 w-5 ${isLinkActive ? "text-blue-600" : "text-gray-500"}`} />}
                  variant={isLinkActive ? "light" : "subtle"}
                  color="blue"
                  className={`
                    transition-all duration-200 h-14
                    ${isLinkActive 
                      ? "bg-blue-50 border-l-4 border-blue-500 text-blue-700 font-semibold" 
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    }
                    rounded-xl
                  `}
                  onClick={() => {
                    setActiveLink(link.href);
                    setOpened(false);
                  }}
                  rightSection={isLinkActive && <ChevronDownIcon className="h-4 w-4 text-blue-500 transform rotate-270" />}
                >
                  <span className="flex-1 text-left">{link.label}</span>
                </Button>
              );
            })}
          </div>

          <Divider my="xl" />

          {/* Quick Actions */}
          <div className="space-y-3">
            <Text size="sm" fw={600} className="text-gray-500 uppercase tracking-wide mb-4">
              Quick Actions
            </Text>
            
            <Group grow>
              <Button 
                variant="light" 
                color="green" 
                size="sm"
                className="rounded-lg"
              >
                Today&apos;s Schedule
              </Button>
              <Button 
                variant="light" 
                color="orange" 
                size="sm"
                className="rounded-lg"
              >
                My Classes
              </Button>
            </Group>
          </div>
        </ScrollArea>

        {/* Drawer Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <Text size="xs" className="text-gray-500">
              &copy; {new Date().getFullYear()} Woldia University
            </Text>
            <Text size="xs" className="text-gray-400">
              Schedule Management System v2.0
            </Text>
          </div>
        </div>
      </Drawer>
    </>
  );
};

export default Header;