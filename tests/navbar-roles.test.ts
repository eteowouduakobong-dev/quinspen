import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import ReactDOMServer from "react-dom/server";

// Dynamic mock state
interface MockClerkUser {
  id: string;
  publicMetadata?: { role?: string };
}

let mockClerkUser: MockClerkUser | null = null;
let mockIsLoaded = true;
let mockIsSignedIn = false;
let mockPathname = "/";

// Mock module registry before importing Navbar
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Module = require("module");
const originalRequire = Module.prototype.require;

Module.prototype.require = function (this: unknown, ...args: [string, ...unknown[]]) {
  const path = args[0];

  if (path === "@clerk/nextjs") {
    return {
      useUser: () => ({
        user: mockClerkUser,
        isLoaded: mockIsLoaded,
        isSignedIn: mockIsSignedIn,
      }),
      useClerk: () => ({
        signOut: async () => {},
      }),
    };
  }

  if (path === "next/navigation") {
    return {
      usePathname: () => mockPathname,
      useRouter: () => ({
        push: () => {},
      }),
    };
  }

  if (path === "next/link") {
    const LinkMock = ({
      href,
      children,
      className,
      ...props
    }: {
      href: string;
      children?: React.ReactNode;
      className?: string;
      [key: string]: unknown;
    }) => {
      return React.createElement(
        "a",
        { href, className, "data-testid": `nav-link-${href}`, ...props },
        children
      );
    };
    LinkMock.default = LinkMock;
    return LinkMock;
  }

  if (path === "@/context/QuinspenContext") {
    return {
      useQuinspen: () => ({
        currentUser: mockIsSignedIn
          ? {
              id: "usr_123",
              penName: "Shadow Quill",
              penTag: "shadowquill",
              bio: "Reflecting in silence",
              avatarIcon: "feather",
              avatarColor: "amber",
            }
          : null,
        unreadWhispersCount: 0,
        ambientTrack: "none",
        setAmbientTrack: () => {},
        openAuthModal: () => {},
        generateNewPenIdentity: async () => {},
        signOut: async () => {
          mockIsSignedIn = false;
          mockClerkUser = null;
        },
      }),
    };
  }

  return originalRequire.apply(this, args);
};

// Import Navbar with the mocks active
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { Navbar } = require("../src/components/Navbar");

// Helper to simulate SSR pass: calls getServerSnapshot which returns false
function renderNavbarSSR(): string {
  return ReactDOMServer.renderToStaticMarkup(React.createElement(Navbar));
}

// Helper to simulate Client-rendered pass: calls getSnapshot which returns true
function renderNavbarClient(): string {
  const originalUseSyncExternalStore = React.useSyncExternalStore;
  try {
    (React as any).useSyncExternalStore = function (
      _subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => boolean,
      _getServerSnapshot?: () => boolean
    ) {
      return getSnapshot();
    };
    return ReactDOMServer.renderToStaticMarkup(React.createElement(Navbar));
  } finally {
    React.useSyncExternalStore = originalUseSyncExternalStore;
  }
}

test("Requirement 9: Hydration Safety - SSR initial pass does not render Admin Dashboard link", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_admin_1",
    publicMetadata: { role: "admin" },
  };

  const ssrHtml = renderNavbarSSR();
  assert.equal(
    ssrHtml.includes("/admin/listeners"),
    false,
    "SSR initial render must not include Admin Dashboard link before mount to prevent hydration mismatch"
  );
  assert.equal(
    ssrHtml.includes("Explore"),
    true,
    "SSR initial render still contains standard links"
  );
});

test("Requirement 2 & 3 & 4: Admin user sees 'Admin Dashboard' link pointing to '/admin/listeners'", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_admin_1",
    publicMetadata: { role: "admin" },
  };

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("/admin/listeners"),
    true,
    "Admin must see link to /admin/listeners"
  );
  assert.equal(
    clientHtml.includes("Admin Dashboard"),
    true,
    "Admin must see 'Admin Dashboard' label"
  );
  // Prominent styling check
  assert.equal(
    clientHtml.includes("border-amber-500"),
    true,
    "Admin Dashboard link must have prominent amber styling"
  );
});

test("Requirement 5: Ordinary users (role: 'user') must NOT see 'Admin Dashboard' link", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_ordinary_1",
    publicMetadata: { role: "user" },
  };

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("/admin/listeners"),
    false,
    "Ordinary user must not see /admin/listeners link"
  );
  assert.equal(
    clientHtml.includes("Admin Dashboard"),
    false,
    "Ordinary user must not see 'Admin Dashboard' label"
  );
});

test("Requirement 5: Users without publicMetadata role must NOT see 'Admin Dashboard' link", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_no_role_1",
    publicMetadata: {},
  };

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("/admin/listeners"),
    false,
    "User with empty metadata must not see /admin/listeners link"
  );
});

test("Requirement 5: Users with publicMetadata undefined must NOT see 'Admin Dashboard' link", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_undefined_meta_1",
  };

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("/admin/listeners"),
    false,
    "User with undefined metadata must not see /admin/listeners link"
  );
});

test("Requirement 5: Unauthenticated / Signed-out visitors must NOT see 'Admin Dashboard' link", () => {
  mockIsLoaded = true;
  mockIsSignedIn = false;
  mockClerkUser = null;

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("/admin/listeners"),
    false,
    "Signed-out user must not see /admin/listeners link"
  );
  assert.equal(
    clientHtml.includes("Sign In"),
    true,
    "Signed-out user must see Sign In button"
  );
});

test("Requirement 6: Preserve all existing navigation links and responsiveness", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_admin_1",
    publicMetadata: { role: "admin" },
  };

  const clientHtml = renderNavbarClient();
  assert.equal(clientHtml.includes("Explore"), true, "Must preserve 'Explore'");
  assert.equal(clientHtml.includes("Circles"), true, "Must preserve 'Circles'");
  assert.equal(clientHtml.includes("Write"), true, "Must preserve 'Write'");
  assert.equal(clientHtml.includes("Whispers"), true, "Must preserve 'Whispers'");
  assert.equal(clientHtml.includes("My Chronicle"), true, "Must preserve 'My Chronicle'");
  assert.equal(clientHtml.includes("QUINSPEN"), true, "Must preserve QUINSPEN logo");
});

test("Requirement 7: Dynamic update on Sign-In and Sign-Out", () => {
  // Step 1: User starts signed out
  mockIsLoaded = true;
  mockIsSignedIn = false;
  mockClerkUser = null;

  let html = renderNavbarClient();
  assert.equal(html.includes("/admin/listeners"), false, "Starts without link when signed out");

  // Step 2: User signs in as admin
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "admin_dynamic",
    publicMetadata: { role: "admin" },
  };

  html = renderNavbarClient();
  assert.equal(html.includes("/admin/listeners"), true, "Link immediately appears after admin sign-in");

  // Step 3: User signs out
  mockIsSignedIn = false;
  mockClerkUser = null;

  html = renderNavbarClient();
  assert.equal(html.includes("/admin/listeners"), false, "Link immediately disappears after sign-out");
});

test("Active link state highlighting when on /admin/listeners", () => {
  mockIsLoaded = true;
  mockIsSignedIn = true;
  mockClerkUser = {
    id: "user_admin_1",
    publicMetadata: { role: "admin" },
  };
  mockPathname = "/admin/listeners";

  const clientHtml = renderNavbarClient();
  assert.equal(
    clientHtml.includes("bg-amber-500/20"),
    true,
    "Admin Dashboard link must have active styling when on /admin/listeners"
  );
});
