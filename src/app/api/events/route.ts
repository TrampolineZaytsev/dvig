import { NextRequest, NextResponse } from "next/server";

import {
  mergeCategorySlugs,
  resolveAllPrimarySlugs,
} from "@/lib/kudago/categories";
import type { EventCategory } from "@/lib/events";
import { resolveDateRange, searchKudagoEvents } from "@/lib/kudago/client";
import { mapKudagoEvents } from "@/lib/kudago/map";

const PRIMARY_SET = new Set<string>(["Кино", "Настолки", "Культура", "Спорт"]);

function parsePrimaryCategories(value: string | null): EventCategory[] {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is EventCategory => PRIMARY_SET.has(item));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const primary = parsePrimaryCategories(searchParams.get("primary"));
    const extraSlugs =
      searchParams.get("categories")
        ?.split(",")
        .map((item) => item.trim())
        .filter(Boolean) ?? [];

    const slugs =
      primary.length > 0 || extraSlugs.length > 0
        ? mergeCategorySlugs(primary, extraSlugs)
        : resolveAllPrimarySlugs();

    const datePreset = searchParams.get("date");
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit")) || 40));

    const { actualSince, actualUntil } = resolveDateRange(
      datePreset,
      dateFrom,
      dateTo
    );

    const payload = await searchKudagoEvents({
      categories: slugs,
      actualSince,
      actualUntil,
      pageSize: limit,
      orderBy: "-favorites_count",
    });

    let events = mapKudagoEvents(payload.results ?? []);

    const q = searchParams.get("q")?.trim().toLowerCase();
    if (q) {
      events = events.filter((event) =>
        `${event.title} ${event.place} ${event.short}`.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({
      events,
      meta: {
        source: "kudago",
        count: events.length,
        fetchedAt: new Date().toISOString(),
        categories: slugs,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "KudaGo events failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
