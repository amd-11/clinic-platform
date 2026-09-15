import { NextResponse, type NextRequest } from "next/server";
import { DatabaseUnavailableError, getDb } from "@/db";
import { getAvailableSlots } from "@/lib/booking/availability";
import { slotsQuerySchema } from "@/lib/booking/validation";

/** GET /api/slots?service=therapy&doctor=anna&date=2026-09-16 (doctor is optional) */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const parsed = slotsQuerySchema.safeParse({
    service: params.get("service"),
    doctor: params.get("doctor") || null,
    date: params.get("date"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_query" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const slots = await getAvailableSlots(db, {
      serviceId: parsed.data.service,
      doctorId: parsed.data.doctor,
      date: parsed.data.date,
    });
    return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
    console.error("[api/slots]", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
