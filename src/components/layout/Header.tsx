"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "홈" },
    { href: "/posts", label: "글 목록" },
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tech Blog
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-gray-500 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Auth section */}
          {status === "loading" ? (
            <div className="w-16" />
          ) : session ? (
            <div className="flex items-center gap-3 ml-2">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ""}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              )}
              <span className="text-xs text-gray-500">
                {session.user?.name}
              </span>
              <Link
                href="/admin"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                관리
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="text-sm text-gray-500 hover:text-foreground transition-colors"
            >
              로그인
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="메뉴 열기"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="md:hidden border-t border-gray-200 dark:border-gray-800 px-4 py-3 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-1 text-sm ${
                pathname === link.href
                  ? "text-foreground font-medium"
                  : "text-gray-500"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
              {session.user?.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || ""}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-xs text-gray-500">{session.user?.name}</span>
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="text-xs text-blue-600"
              >
                관리
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs text-gray-400 ml-auto"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("github")}
              className="block py-1 text-sm text-gray-500"
            >
              로그인
            </button>
          )}
        </nav>
      )}
    </header>
  );
}
