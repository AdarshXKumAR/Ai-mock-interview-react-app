import React from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "@/components/container";
import { MainRoutes } from "@/lib/helpers";

interface SocialLinkProps {
  href: string;
  icon: React.ReactNode;
  hoverColor: string;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon, hoverColor }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`transition-colors hover:${hoverColor}`}
  >
    {icon}
  </a>
);

interface FooterLinkProps {
  to: string;
  children: React.ReactNode;
}

const FooterLink: React.FC<FooterLinkProps> = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="hover:underline text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </Link>
  </li>
);

export const Footer = () => {
  return (
    <div className="w-full bg-black dark:bg-gray-950 text-gray-300 py-8 border-t border-gray-800">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              {MainRoutes.map((route) => (
                <FooterLink key={route.href} to={route.href}>
                  {route.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          {/* About Us */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">About Us</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              We are committed to helping you unlock your full potential with
              AI-powered tools. Our platform offers a wide range of resources to
              improve your interview skills and chances of success.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Services</h3>
            <ul className="space-y-2">
              <FooterLink to="/services/interview-prep">
                Interview Preparation
              </FooterLink>
              <FooterLink to="/services/career-coaching">
                Career Coaching
              </FooterLink>
              <FooterLink to="/services/resume-building">
                Resume Building
              </FooterLink>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Contact Us</h3>
            <p className="mb-4 text-gray-400 text-sm">
              123 AI Street, Tech City, 12345
            </p>
            <div className="flex gap-4 text-gray-400">
              <SocialLink
                href="https://facebook.com"
                icon={<Facebook size={22} />}
                hoverColor="text-blue-500"
              />
              <SocialLink
                href="https://twitter.com"
                icon={<Twitter size={22} />}
                hoverColor="text-sky-400"
              />
              <SocialLink
                href="https://instagram.com"
                icon={<Instagram size={22} />}
                hoverColor="text-pink-500"
              />
              <SocialLink
                href="https://linkedin.com"
                icon={<Linkedin size={22} />}
                hoverColor="text-blue-600"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};