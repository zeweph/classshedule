import React from "react";
import Link from "next/link";
import { 
  Container, 
  Group, 
  Text, 
  Stack, 
  Divider,
  Anchor,
  Badge,
  ActionIcon 
} from "@mantine/core";
import { 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { 
  AcademicCapIcon as AcademicCapSolid
} from "@heroicons/react/24/solid";

// Social media icons from Heroicons
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const LinkedinIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.199-1.558-.75-.947-1.011-2.168-.675-3.387.337-1.219 1.196-2.204 2.34-2.691 1.145-.487 2.446-.425 3.536.168 1.09.593 1.868 1.641 2.119 2.857.25 1.216-.052 2.457-.814 3.406-.762.949-1.913 1.56-3.21 1.56-.068 0-.136-.002-.203-.005zm7.718 1.956c-.557 0-1.007-.45-1.007-1.007 0-.557.45-1.007 1.007-1.007.557 0 1.007.45 1.007 1.007 0 .557-.45 1.007-1.007 1.007zm3.721-4.366c-.104.457-.457.812-.914.919-.457.107-.938-.052-1.273-.387-.335-.335-.494-.816-.387-1.273.104-.457.457-.812.914-.919.457-.107.938.052 1.273.387.335.335.494.816.387 1.273z" clipRule="evenodd" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-white opacity-5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      
      <Container size="xl" className="relative z-10">
        <div className="py-12">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* University Info */}
            <Stack className="col-span-1 md:col-span-2">
              <Group gap="xs" className="mb-4">
                <AcademicCapSolid className="w-8 h-8 text-blue-200" />
                <Text size="xl" fw={700} className="text-white">
                  Woldia University
                </Text>
              </Group>
              <Text size="sm" className="text-blue-100 max-w-md">
                Empowering minds, shaping futures. Woldia University is committed to 
                excellence in education, research, and community service.
              </Text>
              
              <Group gap="xs" className="mt-4">
                <MapPinIcon className="w-5 h-5 text-blue-200" />
                <Text size="sm" className="text-blue-100">
                  Woldia, Ethiopia
                </Text>
              </Group>
              
              <Group gap="xs">
                <PhoneIcon className="w-5 h-5 text-blue-200" />
                <Text size="sm" className="text-blue-100">
                  +251 XXX XXX XXX
                </Text>
              </Group>
              
              <Group gap="xs">
                <EnvelopeIcon className="w-5 h-5 text-blue-200" />
                <Text size="sm" className="text-blue-100">
                  info@woldiauniversity.edu.et
                </Text>
              </Group>
            </Stack>

            {/* Quick Links */}
            <Stack gap="sm">
              <Text size="lg" fw={600} className="text-white mb-2">
                Quick Links
              </Text>
              <Anchor 
                component={Link} 
                href="/" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                Home
              </Anchor>
              <Anchor 
                component={Link} 
                href="/about" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                About 
              </Anchor>
           </Stack>

            {/* Support */}
            <Stack gap="sm">
              <Text size="lg" fw={600} className="text-white mb-2">
                Support
              </Text>
              <Anchor 
                component={Link} 
                href="/help" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4 inline mr-2" />
                Help Center
              </Anchor>
              <Anchor 
                component={Link} 
                href="/contact" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                Contact Us
              </Anchor>
              <Anchor 
                component={Link} 
                href="/feedback" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                Feedback
              </Anchor>
              <Anchor 
                component={Link} 
                href="/sitemap" 
                className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
              >
                Sitemap
              </Anchor>
            </Stack>
          </div>

          <Divider className="my-8 border-blue-500 border-opacity-30"
           />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright and Legal */}
            <Group gap="xl">
              <Group gap="xs">
                <Text size="sm" className="text-blue-100">
                  &copy; {currentYear} Woldia University
                </Text>
                <Badge 
                  color="blue" 
                  variant="filled" 
                  size="sm"
                  className="bg-blue-500 bg-opacity-50"
                >
                  Beta
                </Badge>
              </Group>
              
              <Group gap="md">
                <Anchor 
                  component={Link} 
                  href="/privacy" 
                  className="text-blue-100 hover:text-white transition-colors duration-200 text-sm hover:underline"
                >
                  Privacy Policy
                </Anchor>
                <Anchor 
                  component={Link} 
                  href="/terms" 
                  className="text-blue-100 hover:text-white transition-colors duration-200 text-sm hover:underline"
                >
                  Terms of Service
                </Anchor>
                <Anchor 
                  component={Link} 
                  href="/accessibility" 
                  className="text-blue-100 hover:text-white transition-colors duration-200 text-sm hover:underline"
                >
                  Accessibility
                </Anchor>
              </Group>
            </Group>

            {/* Social Media and Made with love */}
            <Group gap="lg">
              {/* Social Media Icons */}
              <Group gap="xs">
                <ActionIcon 
                  size="md" 
                  variant="filled" 
                  className="bg-blue-500 bg-opacity-50 hover:bg-blue-400 transition-all duration-200 transform hover:scale-110"
                  component="a"
                  href="#"
                  title="Twitter"
                >
                  <TwitterIcon />
                </ActionIcon>
                <ActionIcon 
                  size="md" 
                  variant="filled" 
                  className="bg-blue-500 bg-opacity-50 hover:bg-blue-400 transition-all duration-200 transform hover:scale-110"
                  component="a"
                  href="#"
                  title="Facebook"
                >
                  <FacebookIcon />
                </ActionIcon>
                <ActionIcon 
                  size="md" 
                  variant="filled" 
                  className="bg-blue-500 bg-opacity-50 hover:bg-blue-400 transition-all duration-200 transform hover:scale-110"
                  component="a"
                  href="#"
                  title="LinkedIn"
                >
                  <LinkedinIcon />
                </ActionIcon>
                <ActionIcon 
                  size="md" 
                  variant="filled" 
                  className="bg-blue-500 bg-opacity-50 hover:bg-blue-400 transition-all duration-200 transform hover:scale-110"
                  component="a"
                  href="#"
                  title="Instagram"
                >
                  <InstagramIcon />
                </ActionIcon>
              </Group>

              {/* Made with love */}
              <Group gap="xs" className="text-blue-100">
                <Text size="sm">Made with</Text>
                <Text size="sm">Madonna Ephrem/zed</Text>
              </Group>
            </Group>
          </div>
        </div>
      </Container>

      {/* Wave decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-12"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-current text-blue-900"
          ></path>
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-current text-blue-800"
          ></path>
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-current text-blue-700"
          ></path>
        </svg>
      </div>
    </footer>
  );
};

export default Footer;