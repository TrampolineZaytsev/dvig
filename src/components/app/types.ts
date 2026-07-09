import { dateFilters } from "@/lib/events";

export type AppView = "search" | "profile" | "collection" | "friends" | "settings";
export type DatePreset = (typeof dateFilters)[number];
export type EventSort = "default" | "popular" | "participants";
