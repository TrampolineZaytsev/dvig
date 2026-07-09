/**
 * One-time structural refactor: move files + split event-browser.tsx.
 * Run: node scripts/reorganize-src.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.join(root, "src");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function moveFile(from, to) {
  ensureDir(path.dirname(to));
  if (fs.existsSync(from)) {
    fs.renameSync(from, to);
    console.log(`moved ${path.relative(root, from)} -> ${path.relative(root, to)}`);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(src, rel), "utf8");
}

function write(rel, content) {
  const full = path.join(src, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content, "utf8");
  console.log(`wrote ${rel}`);
}

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (/\.(ts|tsx)$/.test(entry.name)) cb(full);
  }
}

function replaceImportsInFile(file, replacements) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of replacements) {
    if (content.includes(from)) {
      content = content.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(file, content, "utf8");
}

// --- 1. Move lib files ---
const libMoves = [
  ["lib/api.ts", "lib/server/api.ts"],
  ["lib/auth.ts", "lib/server/auth.ts"],
  ["lib/db.ts", "lib/server/db.ts"],
  ["lib/applications.ts", "lib/server/applications.ts"],
  ["lib/notifications.ts", "lib/server/notifications.ts"],
  ["lib/groups.ts", "lib/server/groups.ts"],
  ["lib/api-client.ts", "lib/client/api-client.ts"],
  ["lib/events.ts", "lib/events/index.ts"],
  ["lib/event-dates.ts", "lib/events/dates.ts"],
  ["lib/event-group.ts", "lib/events/group.ts"],
  ["lib/fetch-events.ts", "lib/events/fetch.ts"],
];

for (const [from, to] of libMoves) {
  moveFile(path.join(src, from), path.join(src, to));
}

// --- 2. Move component files ---
const componentMoves = [
  ["components/site-header.tsx", "components/layout/site-header.tsx"],
  ["components/site-footer.tsx", "components/layout/site-footer.tsx"],
  ["components/auth-panel.tsx", "components/auth/auth-panel.tsx"],
  ["components/onboarding-dialog.tsx", "components/auth/onboarding-dialog.tsx"],
  ["components/date-range-picker.tsx", "components/events/date-range-picker.tsx"],
  ["components/kudago-category-picker.tsx", "components/events/kudago-category-picker.tsx"],
  ["components/group-social-panel.tsx", "components/events/group-social-panel.tsx"],
  ["components/waitlist-form.tsx", "components/marketing/waitlist-form.tsx"],
];

for (const [from, to] of componentMoves) {
  moveFile(path.join(src, from), path.join(src, to));
}

// --- 3. Split event-browser ---
const ebPath = path.join(src, "components/event-browser.tsx");
if (!fs.existsSync(ebPath)) {
  console.log("event-browser.tsx already split, skipping");
} else {
  const eb = fs.readFileSync(ebPath, "utf8");
  const lines = eb.split("\n");

  const slice = (start, end) => lines.slice(start - 1, end).join("\n");

  // Extract sections by line numbers (1-based)
  const typesBlock = slice(92, 94);
  const constantsBlock = slice(96, 106);
  const utilsBlock = slice(108, 138);
  const mainBlock = slice(140, 499);
  const appMenuBlock = slice(501, 561);
  const searchPanelBlock = slice(563, 821);
  const filtersBlock = slice(823, 882);
  const formatEventCountBlock = slice(884, 898);
  const sectionTitleBlock = slice(900, 911);
  const menuNavBlock = slice(913, 942);
  const profileViewBlock = slice(944, 1074);
  const friendsBlock = slice(1076, 1105);
  const gridBlock = slice(1107, 1175);
  const sheetBlock = slice(1177, 1394);
  const cardBlock = slice(1396, 1500);
  const collectionBlock = slice(1502, 1611);
  const settingsBlock = slice(1613, 1654);
  const safetyBlock = slice(1656, 1853);
  const profilePanelBlock = slice(1855, 1913);
  const displayBlock = slice(1915, 1992);

  const clientDirective = '"use client";\n\n';

  const exportFns = (code) => code.replace(/^function /gm, "export function ");

  write(
    "components/app/types.ts",
    `import { dateFilters } from "@/lib/events";\n\n${typesBlock.replace(/^type /gm, "export type ")}\n`
  );

  write(
    "components/app/constants.ts",
    `import type { EventMood } from "@/lib/events";\nimport type { EventSort } from "./types";\n\n${constantsBlock.replace(/^const /gm, "export const ")}\n`
  );

  write(
    "components/app/utils.ts",
    `import type { CustomDateRange } from "@/lib/events/dates";\nimport type { DvigEvent, EventCategory, EventMood } from "@/lib/events";\nimport type { DatePreset } from "./types";\n\n${exportFns(utilsBlock)}\n\n${exportFns(formatEventCountBlock)}\n`
  );

  write(
    "components/app/display.tsx",
    `${clientDirective}import { Badge } from "@/components/ui/badge";\nimport { Button } from "@/components/ui/button";\nimport type { LucideIcon } from "lucide-react";\n\n${exportFns(displayBlock.replace(/typeof Search/g, "LucideIcon"))}\n`
  );

  write(
    "components/app/section-title.tsx",
    `${clientDirective}import type { AppView } from "./types";\n\n${exportFns(sectionTitleBlock)}\n`
  );

  write(
    "components/app/app-menu.tsx",
    `${clientDirective}import Link from "next/link";\nimport { useState } from "react";\nimport type { LucideIcon } from "lucide-react";\nimport { CalendarDays, Home, Menu, Settings, UserCheck, UsersRound } from "lucide-react";\nimport { Button } from "@/components/ui/button";\nimport {\n  Sheet,\n  SheetContent,\n  SheetDescription,\n  SheetHeader,\n  SheetTitle,\n  SheetTrigger,\n} from "@/components/ui/sheet";\nimport type { AppView } from "./types";\n\n${exportFns(appMenuBlock)}\n\n${exportFns(menuNavBlock.replace(/typeof Search/g, "LucideIcon"))}\n`
  );

  write(
    "components/app/event-filters.tsx",
    `${clientDirective}import { type ReactNode } from "react";\nimport { X } from "lucide-react";\nimport { Button } from "@/components/ui/button";\n\n${exportFns(filtersBlock)}\n`
  );

  write(
    "components/app/event-search-panel.tsx",
    `${clientDirective}
import { useState } from "react";
import { ChevronDown, ChevronUp, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/events/date-range-picker";
import { KudagoCategoryPicker } from "@/components/events/kudago-category-picker";
import { dateFilters, moodFilters, type EventCategory, type EventMood } from "@/lib/events";
import type { CustomDateRange } from "@/lib/events/dates";
import { formatCustomDateRangeLabel } from "@/lib/events/dates";
import { moodLabels, sortOptions } from "./constants";
import { ActiveFilterChip, FilterGroup, FilterPill } from "./event-filters";
import type { DatePreset, EventSort } from "./types";
import { countActiveFilters, formatEventCount, toggleInList } from "./utils";

${exportFns(searchPanelBlock)}
`
  );

  write(
    "components/app/event-grid.tsx",
    `${clientDirective}
import { Button } from "@/components/ui/button";
import type { DvigEvent } from "@/lib/events";
import { EventCard } from "./event-card";

${exportFns(gridBlock)}
`
  );

  write(
    "components/app/event-card.tsx",
    `${clientDirective}
import { CalendarDays, Heart, MapPin, Sparkles, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DvigEvent } from "@/lib/events";
import { formatGroupLine } from "./utils";

${exportFns(cardBlock)}
`
  );

  write(
    "components/app/event-sheet.tsx",
    `${clientDirective}
import {
  Check,
  Download,
  InfoIcon,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Table2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { GroupSocialPanel } from "@/components/events/group-social-panel";
import type { ApiUser } from "@/lib/client/api-client";
import type { DvigEvent } from "@/lib/events";
import type { GroupSummary } from "@/lib/server/groups";
import { Info, SummaryItem } from "./display";
import { formatGroupLine, mockParticipantInitials } from "./utils";

${exportFns(sheetBlock)}
`
  );

  write(
    "components/app/profile-view.tsx",
    `${clientDirective}
import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AuthPanel } from "@/components/auth/auth-panel";
import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import type { MyGroupWithPending } from "@/hooks/use-pilot-data";
import { Metric } from "./display";

${exportFns(profileViewBlock)}
`
  );

  write(
    "components/app/friends-panel.tsx",
    `${clientDirective}
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

${exportFns(friendsBlock)}
`
  );

  write(
    "components/app/collection-panel.tsx",
    `${clientDirective}
import { Clipboard, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { DvigEvent } from "@/lib/events";

${exportFns(collectionBlock)}
`
  );

  write(
    "components/app/safety-panel.tsx",
    `${clientDirective}
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BellRing,
  Check,
  LogOut,
  MapPin,
  ShieldCheck,
  TriangleAlert,
  UserCheck,
} from "lucide-react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  submitCheckIn,
  submitFeedback,
  submitReport,
  updateProfile,
} from "@/lib/client/api-client";
import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import { SafetyCard, SafetyRow } from "./display";

${exportFns(safetyBlock)}
`
  );

  write(
    "components/app/profile-panel.tsx",
    `${clientDirective}
import Link from "next/link";
import { useState } from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiUser } from "@/lib/client/api-client";
import { SafetyRow, TraceItem } from "./display";

${exportFns(profilePanelBlock)}
`
  );

  write(
    "components/app/settings-panel.tsx",
    `${clientDirective}
import type { ApiUser } from "@/lib/client/api-client";
import type { ApplicationSummary } from "@/lib/server/groups";
import { ProfilePanel } from "./profile-panel";
import { SafetyPanel } from "./safety-panel";

${exportFns(settingsBlock)}
`
  );

  write(
    "components/app/event-browser.tsx",
    `${clientDirective}
import { useEffect, useMemo, useState } from "react";
import { OnboardingDialog } from "@/components/auth/onboarding-dialog";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { usePilotData } from "@/hooks/use-pilot-data";
import { trackEvent } from "@/lib/client/api-client";
import {
  buildTelegramDigest,
  categoryFilters,
  type DvigEvent,
  type EventCategory,
  type EventMood,
} from "@/lib/events";
import type { CustomDateRange } from "@/lib/events/dates";
import { eventMatchesDateFilter } from "@/lib/events/dates";
import { fetchDvigEvents } from "@/lib/events/fetch";
import { dateFilters } from "@/lib/events";
import { AppMenu } from "./app-menu";
import { CollectionPanel } from "./collection-panel";
import { EventGrid } from "./event-grid";
import { EventSearchPanel } from "./event-search-panel";
import { EventSheet } from "./event-sheet";
import { FriendsPanel } from "./friends-panel";
import { ProfileView } from "./profile-view";
import { SectionTitle } from "./section-title";
import { SettingsPanel } from "./settings-panel";
import type { AppView, EventSort } from "./types";

${mainBlock.replace(/^export function EventBrowser/, "export function EventBrowser")}
`
  );

  fs.unlinkSync(ebPath);
  console.log("removed components/event-browser.tsx");
}

// --- 4. Global import replacements ---
const replacements = [
  ['@/lib/event-dates', '@/lib/events/dates'],
  ['@/lib/event-group', '@/lib/events/group'],
  ['@/lib/fetch-events', '@/lib/events/fetch'],
  ['@/lib/api-client', '@/lib/client/api-client'],
  ['@/lib/applications', '@/lib/server/applications'],
  ['@/lib/notifications', '@/lib/server/notifications'],
  ['@/lib/groups', '@/lib/server/groups'],
  ['@/lib/auth', '@/lib/server/auth'],
  ['@/lib/db', '@/lib/server/db'],
  ['@/lib/api', '@/lib/server/api'],
  ['@/components/site-header', '@/components/layout/site-header'],
  ['@/components/site-footer', '@/components/layout/site-footer'],
  ['@/components/auth-panel', '@/components/auth/auth-panel'],
  ['@/components/onboarding-dialog', '@/components/auth/onboarding-dialog'],
  ['@/components/date-range-picker', '@/components/events/date-range-picker'],
  ['@/components/kudago-category-picker', '@/components/events/kudago-category-picker'],
  ['@/components/group-social-panel', '@/components/events/group-social-panel'],
  ['@/components/waitlist-form', '@/components/marketing/waitlist-form'],
  ['@/components/event-browser', '@/components/app/event-browser'],
];

// Also update prisma seed if exists
const extraFiles = [
  path.join(root, "prisma", "seed.ts"),
];

walk(src, (file) => replaceImportsInFile(file, replacements));
for (const file of extraFiles) {
  if (fs.existsSync(file)) replaceImportsInFile(file, replacements);
}

// Fix internal relative imports in moved lib files
const serverAuth = path.join(src, "lib/server/auth.ts");
if (fs.existsSync(serverAuth)) {
  let c = fs.readFileSync(serverAuth, "utf8");
  c = c.replace('@/lib/config', '@/lib/config');
  fs.writeFileSync(serverAuth, c);
}

const eventsDates = path.join(src, "lib/events/dates.ts");
if (fs.existsSync(eventsDates)) {
  let c = fs.readFileSync(eventsDates, "utf8");
  c = c.replace('@/lib/events', '@/lib/events');
  fs.writeFileSync(eventsDates, c);
}

console.log("Done. Run: npm run build");
