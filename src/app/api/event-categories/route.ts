import { NextResponse } from "next/server";

import { fetchKudagoEventCategories } from "@/lib/kudago/client";

export async function GET() {
  try {
    const categories = await fetchKudagoEventCategories("spb");
    const items = categories
      .map((item) => ({
        slug: item.slug,
        name: item.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));

    return NextResponse.json({ categories: items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "KudaGo categories failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
