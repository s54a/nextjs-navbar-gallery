import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type NavSide = "left" | "right" | "top" | "bottom";

interface ResponsiveWidth {
  base?: string;
  md?: string;
  lg?: string;
}

interface LogoScale {
  initial: number;
  scrolled: number;
}

interface NavLink {
  id: string;
  label: string;
  href: string;
}

export interface NavbarConfig {
  side?: NavSide;
  width?: string | ResponsiveWidth;
  initialBg?: string;
  scrolledBg?: string;
  scrollThreshold?: number;
  logoScale?: LogoScale;
  closeOnRouteChange?: boolean;
  trapFocus?: boolean;
  disableBodyScrollOnOpen?: boolean;
  ariaLabel?: string;
  animateDuration?: number;
  enableScrollSpy?: boolean;
  mobileBreakpoint?: "sm" | "md" | "lg"; // When to show hamburger vs full nav
}

interface NavbarProps {
  config?: NavbarConfig;
  logo?: React.ReactNode;
  links: NavLink[];
  onNavigate?: (href: string) => void;
}

// ============================================================================
// CUSTOM HOOKS
// ============================================================================

// Hook to detect scroll state
const useScrollState = (threshold: number = 20) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return isScrolled;
};

// Hook to lock body scroll
const useLockBodyScroll = (lock: boolean) => {
  useEffect(() => {
    if (!lock) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [lock]);
};

// Hook for scroll spy functionality
const useScrollSpy = (sectionIds: string[], enabled: boolean) => {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (!enabled) return;

    const observers = sectionIds.map((id) => {
      const element = document.getElementById(id);
      if (!element) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (!entry) return; // <-- guard against undefined entry
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        { rootMargin: "-20% 0px -80% 0px" },
      );

      observer.observe(element);
      return observer;
    });

    return () => {
      observers.forEach((observer) => observer?.disconnect());
    };
  }, [sectionIds, enabled]);

  return activeId;
};

// Hook for focus trap (mobile menu only)
// Accept a broad ref type and allow null current safely
const useFocusTrap = (
  isOpen: boolean,
  containerRef: React.RefObject<HTMLElement | null>,
) => {
  useEffect(() => {
    if (!isOpen) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] ?? null;
    const lastElement = focusableElements[focusableElements.length - 1] ?? null;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTab);
    firstElement?.focus();

    return () => container.removeEventListener("keydown", handleTab);
  }, [isOpen, containerRef]);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Navbar: React.FC<NavbarProps> = ({
  config = {},
  logo = "LOGO",
  links,
  onNavigate,
}) => {
  // Default configuration
  const {
    side = "right",
    width = { base: "100vw", md: "80vw", lg: "50vw" },
    initialBg = "transparent",
    scrolledBg = "bg-white/95 shadow-md",
    scrollThreshold = 20,
    logoScale = { initial: 1, scrolled: 0.92 },
    closeOnRouteChange = true,
    trapFocus = true,
    disableBodyScrollOnOpen = true,
    ariaLabel = "Main navigation",
    animateDuration = 300,
    enableScrollSpy = false,
    mobileBreakpoint = "md", // Show hamburger below this breakpoint
  } = config;

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [currentRoute, setCurrentRoute] = useState("");
  const isScrolled = useScrollState(scrollThreshold);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // Get section IDs for scroll spy
  const sectionIds = links.map((link) => link.id);
  const activeScrollSpyId = useScrollSpy(sectionIds, enableScrollSpy);

  // Determine active link
  const activeLink = enableScrollSpy ? activeScrollSpyId : currentRoute;

  // Lock body scroll when menu is open (mobile only)
  useLockBodyScroll(isOpen && disableBodyScrollOnOpen);

  // Focus trap (mobile only)
  if (trapFocus) {
    // cast menuRef to broader HTMLElement|null ref to satisfy the hook's param
    useFocusTrap(isOpen, menuRef as React.RefObject<HTMLElement | null>);
  }

  // Detect reduced motion preference (guarded for SSR)
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const duration = prefersReducedMotion ? 0 : animateDuration / 1000;

  // Close menu on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  // Track current route
  useEffect(() => {
    if (typeof window !== "undefined") {
      // ensure we always set a string (fixes the string | undefined problem)
      setCurrentRoute(window.location.hash || links[0]?.href || "");
    }
  }, [links]);

  // Close menu handler
  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setTimeout(() => buttonRef.current?.focus(), 100);
  }, []);

  // Handle link click
  const handleLinkClick = (href: string) => {
    if (closeOnRouteChange) {
      closeMenu();
    }

    setCurrentRoute(href);

    if (onNavigate) {
      onNavigate(href);
    } else if (enableScrollSpy) {
      const element = document.getElementById(href.replace("#", ""));
      element?.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle outside click
  const handleBackdropClick = () => {
    closeMenu();
  };

  // Animation variants for slide-in (mobile)
  const slideVariants = {
    left: {
      initial: { x: "-100%" },
      animate: { x: 0 },
      exit: { x: "-100%" },
    },
    right: {
      initial: { x: "100%" },
      animate: { x: 0 },
      exit: { x: "100%" },
    },
    top: {
      initial: { y: "-100%" },
      animate: { y: 0 },
      exit: { y: "-100%" },
    },
    bottom: {
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
    },
  };

  // Background class
  const bgClass = isScrolled ? scrolledBg : initialBg;

  // Logo scale
  const currentLogoScale = isScrolled ? logoScale.scrolled : logoScale.initial;

  // Breakpoint classes
  const breakpointClass =
    mobileBreakpoint === "sm" ? "sm" : mobileBreakpoint === "lg" ? "lg" : "md";

  return (
    <>
      {/* Top Navbar */}
      <motion.nav
        className={`fixed top-0 right-0 left-0 z-40 transition-all duration-300 ${bgClass}`}
        initial={false}
        animate={{
          paddingTop: isScrolled ? "0.75rem" : "1.25rem",
          paddingBottom: isScrolled ? "0.75rem" : "1.25rem",
        }}
        transition={{ duration }}
        role="navigation"
        aria-label={ariaLabel}
      >
        <div className="container mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <motion.div
            className="text-xl font-bold"
            animate={{ scale: currentLogoScale }}
            transition={{ duration }}
          >
            {logo}
          </motion.div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav
            className={`hidden ${breakpointClass}:block`}
            aria-label="Desktop navigation"
          >
            <ul className="flex items-center gap-1">
              {links.map((link) => {
                const isActive =
                  activeLink === link.href || activeLink === link.id;
                return (
                  <li key={link.id}>
                    <motion.a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.href);
                      }}
                      className={`rounded-lg px-4 py-2 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                        isActive
                          ? "bg-blue-500 font-semibold text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      } `}
                      animate={{
                        paddingTop: isScrolled ? "0.5rem" : "0.75rem",
                        paddingBottom: isScrolled ? "0.5rem" : "0.75rem",
                      }}
                      transition={{ duration }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Hamburger Button - Visible on mobile only */}
          <button
            ref={buttonRef}
            onClick={() => setIsOpen(true)}
            className={`${breakpointClass}:hidden flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none`}
            aria-expanded={isOpen}
            aria-controls="slide-menu"
            aria-label="Open navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </motion.nav>

      {/* Mobile Slide-in Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration }}
              onClick={handleBackdropClick}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              ref={menuRef}
              id="slide-menu"
              className={`fixed z-50 min-h-screen overflow-x-hidden overflow-y-auto bg-white shadow-2xl ${side === "left" ? "top-0 left-0" : ""} ${side === "right" ? "top-0 right-0" : ""} ${side === "top" ? "top-0 right-0 left-0" : ""} ${side === "bottom" ? "right-0 bottom-0 left-0" : ""} ${side === "left" || side === "right" ? "w-full md:w-[80vw] lg:w-[50vw]" : ""} `}
              variants={slideVariants[side]}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration, ease: "easeInOut" }}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Close Button */}
              <div className="flex justify-end p-4">
                <button
                  onClick={closeMenu}
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  aria-label="Close navigation menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Mobile Navigation Links */}
              <nav className="px-8 pb-8">
                <ul className="space-y-2">
                  {links.map((link) => {
                    const isActive =
                      activeLink === link.href || activeLink === link.id;
                    return (
                      <li key={link.id}>
                        <a
                          href={link.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleLinkClick(link.href);
                          }}
                          className={`block rounded-lg px-4 py-3 text-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                            isActive
                              ? "bg-blue-500 font-semibold text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          } `}
                        >
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

const NavbarExample: React.FC = () => {
  const navConfig: NavbarConfig = {
    side: "right",
    width: { base: "100vw", md: "80vw", lg: "50vw" },
    initialBg: "bg-transparent",
    scrolledBg: "bg-white/95 shadow-md",
    scrollThreshold: 20,
    logoScale: { initial: 1, scrolled: 0.92 },
    closeOnRouteChange: true,
    trapFocus: true,
    enableScrollSpy: true,
    mobileBreakpoint: "md", // Show hamburger below 768px
  };

  const navLinks: NavLink[] = [
    { id: "hero", label: "Home", href: "#hero" },
    { id: "about", label: "About", href: "#about" },
    { id: "services", label: "Services", href: "#services" },
    { id: "contact", label: "Contact", href: "#contact" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        config={navConfig}
        logo={<span className="text-2xl font-bold text-blue-600">MyBrand</span>}
        links={navLinks}
      />

      {/* Page Content */}
      <section
        id="hero"
        className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-500 to-purple-600"
      >
        <div className="px-4 text-center text-white">
          <h1 className="mb-4 text-5xl font-bold">Welcome</h1>
          <p className="mb-2 text-xl">
            Desktop: Full navbar with links visible
          </p>
          <p className="text-xl">Mobile: Hamburger menu that slides in</p>
          <p className="mt-4 text-sm opacity-75">
            Resize your browser to see the responsive behavior
          </p>
        </div>
      </section>

      <section
        id="about"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <div className="max-w-2xl px-4">
          <h2 className="mb-6 text-4xl font-bold">About Us</h2>
          <p className="mb-4 text-lg text-gray-600">
            On <strong>desktop screens</strong> (≥768px), navigation links are
            displayed inline in the navbar. The navbar background changes as you
            scroll, and nav items smoothly adjust their padding.
          </p>
          <p className="text-lg text-gray-600">
            On <strong>mobile screens</strong> (&lt;768px), a hamburger menu
            appears that opens a slide-in panel. Active links are highlighted
            based on the current section (scroll spy).
          </p>
        </div>
      </section>

      <section
        id="services"
        className="flex min-h-screen items-center justify-center bg-gray-100"
      >
        <div className="max-w-2xl px-4">
          <h2 className="mb-6 text-4xl font-bold">Our Services</h2>
          <p className="mb-4 text-lg text-gray-600">
            The mobile menu slides in from the right (configurable), locks body
            scroll, and can be closed by clicking outside, pressing Escape, or
            clicking a link.
          </p>
          <p className="text-lg text-gray-600">
            Desktop navigation remains always visible with hover effects and
            smooth transitions.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="flex min-h-screen items-center justify-center bg-white"
      >
        <div className="max-w-2xl px-4">
          <h2 className="mb-6 text-4xl font-bold">Get In Touch</h2>
          <p className="text-lg text-gray-600">
            All accessibility features work on both mobile and desktop: keyboard
            navigation, ARIA attributes, focus management, and
            prefers-reduced-motion support.
          </p>
        </div>
      </section>
    </div>
  );
};

export default NavbarExample;
