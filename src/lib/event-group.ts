import type { DvigEvent } from "@/lib/events";

/** Собирает ISO datetime из полей события KudaGo для создания группы. */
export function eventToGroupDateTime(event: DvigEvent): string {
  const [hours = "19", minutes = "00"] = event.time.replace(/[^\d:]/g, "").split(":");
  const date = new Date(`${event.eventDate}T${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}:00`);
  if (Number.isNaN(date.getTime())) {
    return new Date(`${event.eventDate}T19:00:00`).toISOString();
  }
  return date.toISOString();
}
