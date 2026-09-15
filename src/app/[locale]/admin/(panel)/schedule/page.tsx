import { connection } from "next/server";
import type { Locale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { DemoDataControls } from "@/components/admin/demo-data-controls";
import { ScheduleEditor } from "@/components/admin/schedule-editor";
import { getDb } from "@/db";
import { requireSession } from "@/lib/admin/guard";
import { getAdminFormatting } from "@/lib/admin/labels";
import { getScheduleEditorData } from "@/lib/admin/queries";
import type { doctors } from "@/lib/site-data";

type DoctorKey = (typeof doctors)[number]["id"];

export default async function AdminSchedulePage({ params }: PageProps<"/[locale]/admin/schedule">) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  setRequestLocale(locale);
  await connection();

  const session = await requireSession(locale);
  const [t, tDoctors, fmt, data] = await Promise.all([
    getTranslations("admin.schedule"),
    getTranslations("doctors.items"),
    getAdminFormatting(locale),
    getDb().then((db) => getScheduleEditorData(db)),
  ]);
  const readOnly = session.role !== "admin";

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-1 text-muted">{t("subtitle")}</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {data.doctors.map((doctor) => (
          <ScheduleEditor
            key={doctor.id}
            readOnly={readOnly}
            doctor={{
              id: doctor.id,
              name: fmt.doctorName(doctor.id),
              role: tDoctors(`${doctor.id as DoctorKey}.role`),
              hue: doctor.hue,
              active: doctor.active,
              services: doctor.serviceIds.map((id) => fmt.serviceTitle(id)),
              schedule: doctor.schedule,
            }}
          />
        ))}
      </div>

      <div className="mt-8">
        <DemoDataControls count={data.demoAppointments} readOnly={readOnly} />
      </div>
    </div>
  );
}
