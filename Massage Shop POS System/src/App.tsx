import { useMemo, useState } from "react";

type IconName =
  | "grid"
  | "calendar"
  | "users"
  | "chart"
  | "settings"
  | "search"
  | "bell"
  | "plus"
  | "minus"
  | "trash"
  | "user"
  | "door"
  | "clock"
  | "close"
  | "check"
  | "edit"
  | "menu";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="3" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21H9.6v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.6-1H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.38.61.97.98 1.6 1v4c-.63.02-1.22.39-1.6 1Z" />
      </>
    ),
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M14 21h-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    trash: <><path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    door: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 21V7h8v14M14 14h.01" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    check: <path d="m5 12 4 4L19 6" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {paths[name]}
    </svg>
  );
}

const categories = ["ทั้งหมด", "นวดไทย", "อโรมา", "สปา", "แพ็กเกจ"];
const services = [
  { id: 1, title: "นวดไทย", desc: "ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ไทย", duration: 60, price: 350, category: "นวดไทย", color: "sage" },
  { id: 2, title: "นวดไทย", desc: "ผ่อนคลายกล้ามเนื้อด้วยศาสตร์ไทย", duration: 90, price: 500, category: "นวดไทย", color: "sage" },
  { id: 3, title: "นวดน้ำมันอโรม่า", desc: "น้ำมันหอมระเหยช่วยให้ผ่อนคลาย", duration: 60, price: 550, category: "อโรมา", color: "rose" },
  { id: 4, title: "นวดน้ำมันอโรม่า", desc: "น้ำมันหอมระเหยช่วยให้ผ่อนคลาย", duration: 90, price: 750, category: "อโรมา", color: "rose" },
  { id: 5, title: "นวดฝ่าเท้า", desc: "กระตุ้นจุดสะท้อนเพื่อสุขภาพ", duration: 60, price: 400, category: "สปา", color: "sand" },
  { id: 6, title: "นวดประคบสมุนไพร", desc: "ประคบร้อน คลายอาการปวดเมื่อย", duration: 90, price: 650, category: "สปา", color: "mint" },
  { id: 7, title: "สครับผิวกาย", desc: "ผลัดเซลล์ผิวอย่างอ่อนโยน", duration: 45, price: 600, category: "สปา", color: "lavender" },
  { id: 8, title: "แพ็กเกจอิ่มเอม", desc: "นวดไทย + ประคบสมุนไพร", duration: 120, price: 890, category: "แพ็กเกจ", color: "amber" },
];

type Service = (typeof services)[number];
type CartItem = Service & { quantity: number };

const modules = [
  { id: "dashboard", label: "Dashboard", icon: "grid", features: ["ภาพรวมวันนี้", "ยอดขาย", "จำนวนลูกค้า", "สถานะห้อง", "Therapist วันนี้", "สรุปยอดรายวัน"] },
  { id: "pos", label: "POS / ขาย", icon: "plus", features: ["เปิดบิลใหม่", "Walk-in", "รายการบริการ", "เลือก Therapist", "เลือกห้อง", "ส่วนลด / Promotion", "Package", "ชำระเงิน", "พิมพ์ใบเสร็จ"] },
  { id: "booking", label: "Booking", icon: "calendar", features: ["ปฏิทินนัดหมาย", "นัดหมายใหม่", "รายการนัดหมาย", "Check-in", "Reschedule", "Cancel"] },
  { id: "rooms", label: "ห้อง / เตียง", icon: "door", features: ["Room Board", "ห้องว่าง", "กำลังให้บริการ", "จองแล้ว", "กำลังทำความสะอาด", "ปิดใช้งาน"] },
  { id: "customers", label: "ลูกค้า", icon: "users", features: ["รายชื่อลูกค้า", "เพิ่มลูกค้า", "ข้อมูลลูกค้า", "ประวัติการใช้บริการ", "Package", "Voucher", "Point", "Customer Tags"] },
  { id: "therapists", label: "Therapist / พนักงาน", icon: "user", features: ["รายชื่อพนักงาน", "Skill / ความสามารถ", "ตารางงาน", "Check-in / Check-out", "Commission", "สรุปค่ามือ"] },
  { id: "packages", label: "Package / Course", icon: "calendar", features: ["รายการ Package", "สร้าง Package", "Package ลูกค้า", "การใช้สิทธิ์", "วันหมดอายุ"] },
  { id: "promotions", label: "Promotion", icon: "plus", features: ["Promotion", "Discount", "Voucher", "Campaign"] },
  { id: "inventory", label: "สินค้า / Inventory", icon: "grid", features: ["รายการสินค้า", "Stock", "รับสินค้า", "ตัด Stock", "ปรับ Stock", "Stock Movement"] },
  { id: "finance", label: "การเงิน", icon: "chart", features: ["รายการขาย", "รายการรับเงิน", "เปิด/ปิดกะ", "Cash Drawer", "Refund", "Daily Closing"] },
  { id: "reports", label: "Reports", icon: "chart", features: ["Sales Report", "Service Report", "Therapist Performance", "Commission Report", "Payment Report", "Customer Report", "Package Report", "Inventory Report", "Profit / Cost"] },
  { id: "analytics", label: "Analytics", icon: "chart", features: ["Sales Trend", "Service Ranking", "Therapist Performance", "Customer ใหม่ / เก่า", "Peak Hour"] },
  { id: "settings", label: "ตั้งค่า", icon: "settings", features: ["สาขา", "ห้อง / เตียง", "Services", "ราคา", "Therapist", "Commission Rules", "Payment Methods", "Tax / Receipt", "System Settings"] },
  { id: "admin", label: "Administration", icon: "settings", features: ["Users", "Roles / Permissions", "Audit Log", "System Log"] },
] as const;

function Dashboard({ onOpenPOS }: { onOpenPOS: () => void }) {
  const rooms = [
    ["ห้อง 01", "กำลังให้บริการ", "คุณน้ำฝน", "35 นาที", "busy"],
    ["ห้อง 02", "จองแล้ว", "14:30 น.", "คุณพลอย", "booked"],
    ["ห้อง 03", "ว่าง", "พร้อมให้บริการ", "", "available"],
    ["ห้อง 04", "ทำความสะอาด", "ประมาณ 10 นาที", "", "cleaning"],
    ["ห้อง 05", "ว่าง", "พร้อมให้บริการ", "", "available"],
  ];
  return (
    <section className="dashboard-page">
      <div className="dashboard-intro">
        <div><p>ภาพรวมวันนี้</p><h2>สวัสดีตอนบ่าย, คุณมะลิ</h2><span>วันนี้ร้านกำลังไปได้ดี มีนัดหมายถัดไปในอีก 20 นาที</span></div>
        <button onClick={onOpenPOS}><Icon name="plus" /> เปิดบิลใหม่</button>
      </div>
      <div className="metric-grid">
        <article className="metric-card featured"><div className="metric-icon">฿</div><span>ยอดขายวันนี้</span><strong>฿24,850</strong><small>↑ 12.5% จากเมื่อวาน</small></article>
        <article className="metric-card"><div className="metric-icon"><Icon name="users" /></div><span>ลูกค้าวันนี้</span><strong>18 <em>คน</em></strong><small>นัดหมาย 12 · Walk-in 6</small></article>
        <article className="metric-card"><div className="metric-icon"><Icon name="door" /></div><span>ห้องว่าง</span><strong>2 <em>/ 5 ห้อง</em></strong><small>ให้บริการ 1 · จองแล้ว 1</small></article>
        <article className="metric-card"><div className="metric-icon"><Icon name="user" /></div><span>Therapist วันนี้</span><strong>6 <em>คน</em></strong><small>กำลังให้บริการ 3 · ว่าง 3</small></article>
      </div>
      <div className="dashboard-columns">
        <article className="dashboard-card sales-card">
          <div className="card-heading"><div><h3>ยอดขายรายวัน</h3><p>สัปดาห์นี้เทียบกับสัปดาห์ก่อน</p></div><button>7 วันล่าสุด</button></div>
          <div className="chart-area">
            <div className="chart-y"><span>30k</span><span>20k</span><span>10k</span><span>0</span></div>
            <div className="bars">
              {["พ.", "พฤ.", "ศ.", "ส.", "อา.", "จ.", "อ."].map((day, index) => <div className={index === 6 ? "current" : ""} key={day}><i className={`bar-${index}`} /><span>{day}</span></div>)}
            </div>
          </div>
        </article>
        <article className="dashboard-card next-bookings">
          <div className="card-heading"><div><h3>นัดหมายถัดไป</h3><p>3 รายการที่กำลังจะมาถึง</p></div><button>ดูทั้งหมด</button></div>
          {[
            ["14:30", "ศิริพร แสงทอง", "นวดอโรม่า · 60 นาที", "พ"],
            ["15:00", "กิตติพงษ์ วัฒนา", "นวดไทย · 90 นาที", "ก"],
            ["15:30", "พรทิพย์ สวัสดี", "นวดฝ่าเท้า · 60 นาที", "พ"],
          ].map((booking) => <div className="booking-row" key={booking[0]}><time>{booking[0]}</time><div className="mini-avatar">{booking[3]}</div><div><strong>{booking[1]}</strong><span>{booking[2]}</span></div><i /></div>)}
        </article>
      </div>
      <article className="dashboard-card room-board">
        <div className="card-heading"><div><h3>สถานะห้อง</h3><p>อัปเดตแบบเรียลไทม์</p></div><div className="status-legend"><span><i className="available" />ว่าง</span><span><i className="busy" />ให้บริการ</span><span><i className="booked" />จองแล้ว</span></div></div>
        <div className="room-grid">
          {rooms.map((room) => <div className={`room-tile ${room[4]}`} key={room[0]}><div><Icon name="door" /><span>{room[1]}</span></div><strong>{room[0]}</strong><p>{room[2]}</p><small>{room[3]}</small></div>)}
        </div>
      </article>
    </section>
  );
}

const bookingEvents = [
  { id: 1, date: "2025-06-03", time: "10:00", customer: "วราภรณ์", service: "นวดไทย 60 นาที", therapist: "น้ำฝน", status: "checked" },
  { id: 2, date: "2025-06-03", time: "13:30", customer: "คุณ David", service: "Aroma 90 นาที", therapist: "มะลิ", status: "confirmed" },
  { id: 3, date: "2025-06-07", time: "11:00", customer: "พรทิพย์", service: "สครับผิวกาย", therapist: "พลอย", status: "confirmed" },
  { id: 4, date: "2025-06-10", time: "14:30", customer: "จิราพร", service: "นวดฝ่าเท้า", therapist: "น้ำฝน", status: "waiting" },
  { id: 5, date: "2025-06-14", time: "16:00", customer: "กมลวรรณ", service: "แพ็กเกจอิ่มเอม", therapist: "มะลิ", status: "confirmed" },
  { id: 6, date: "2025-06-18", time: "10:30", customer: "วราภรณ์ สุขใจ", service: "นวดไทย 60 นาที", therapist: "น้ำฝน", status: "checked" },
  { id: 7, date: "2025-06-18", time: "14:30", customer: "ศิริพร แสงทอง", service: "นวดอโรม่า 60 นาที", therapist: "พลอย", status: "confirmed" },
  { id: 8, date: "2025-06-18", time: "15:00", customer: "กิตติพงษ์ วัฒนา", service: "นวดไทย 90 นาที", therapist: "มะลิ", status: "waiting" },
  { id: 9, date: "2025-06-18", time: "17:30", customer: "พรทิพย์ สวัสดี", service: "นวดฝ่าเท้า 60 นาที", therapist: "น้ำฝน", status: "confirmed" },
  { id: 10, date: "2025-06-21", time: "12:00", customer: "Rachel M.", service: "Aroma 90 นาที", therapist: "พลอย", status: "confirmed" },
  { id: 11, date: "2025-06-24", time: "10:00", customer: "ธนกร", service: "นวดประคบสมุนไพร", therapist: "มะลิ", status: "waiting" },
  { id: 12, date: "2025-06-28", time: "15:30", customer: "นภัสสร", service: "นวดไทย 60 นาที", therapist: "น้ำฝน", status: "confirmed" },
];

function BookingCalendar() {
  type TimelineBooking = {
    id: number; customer: string; service: string; staff: string; room: string;
    start: number; duration: number; time: string; status: "reserved" | "started" | "waiting" | "done";
  };
  const initialTimelineBookings: TimelineBooking[] = [
    { id: 1, customer: "วราภรณ์", service: "นวดไทย 60 นาที", staff: "น้ำฝน", room: "ห้อง 01", start: 2, duration: 2, time: "10:00–11:00", status: "started" },
    { id: 2, customer: "ศิริพร", service: "นวดอโรม่า 90 นาที", staff: "พลอย", room: "ห้อง 02", start: 5, duration: 3, time: "11:30–13:00", status: "reserved" },
    { id: 3, customer: "กิตติพงษ์", service: "นวดไทย 90 นาที", staff: "มะลิ", room: "ห้อง 03", start: 8, duration: 3, time: "13:00–14:30", status: "waiting" },
    { id: 4, customer: "พรทิพย์", service: "นวดฝ่าเท้า 60 นาที", staff: "อรทัย", room: "ห้อง 05", start: 10, duration: 2, time: "14:00–15:00", status: "started" },
    { id: 5, customer: "Rachel M.", service: "Aroma Massage", staff: "พลอย", room: "ห้อง 02", start: 13, duration: 2, time: "15:30–16:30", status: "done" },
    { id: 6, customer: "ธนกร", service: "ประคบสมุนไพร", staff: "มะลิ", room: "ห้อง 04", start: 14, duration: 3, time: "16:00–17:30", status: "reserved" },
    { id: 7, customer: "นภัสสร", service: "นวดไทย 60 นาที", staff: "น้ำฝน", room: "ห้อง 03", start: 15, duration: 2, time: "16:30–17:30", status: "reserved" },
  ];
  const blankBooking = { customer: "", service: "นวดไทย 60 นาที", staff: "น้ำฝน", room: "ห้อง 01", time: "10:00", status: "reserved" as TimelineBooking["status"] };
  const resourceView = "staff" as const;
  const [selectedDay, setSelectedDay] = useState(18);
  const [timelineBookings, setTimelineBookings] = useState<TimelineBooking[]>(initialTimelineBookings);
  const [bookingDraft, setBookingDraft] = useState<typeof blankBooking | null>(null);
  const [dragSelection, setDragSelection] = useState<{ resource: string; start: number; duration: number } | null>(null);
  const [draggedBookingId, setDraggedBookingId] = useState<number | null>(null);
  const resources = [{ name: "น้ำฝน", detail: "นวดไทย · อโรมา" }, { name: "มะลิ", detail: "นวดไทย · สมุนไพร" }, { name: "พลอย", detail: "อโรมา · สครับ" }, { name: "อรทัย", detail: "นวดเท้า · นวดไทย" }, { name: "จิรา", detail: "นวดไทย · อโรมา" }];
  const statusLabel = { reserved: "จองแล้ว", started: "เริ่มแล้ว", waiting: "รอเริ่ม", done: "เสร็จแล้ว" };
  const timeLabels = Array.from({ length: 19 }, (_, index) => `${String(9 + Math.floor(index / 2)).padStart(2, "0")}:${index % 2 ? "30" : "00"}`);
  const slotFromPointer = (event: React.PointerEvent<HTMLDivElement> | React.DragEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(17, Math.floor(((event.clientX - bounds.left) / bounds.width) * 18)));
  };
  const slotToTime = (slot: number) => `${String(9 + Math.floor(slot / 2)).padStart(2, "0")}:${slot % 2 ? "30" : "00"}`;
  const bookingTime = (start: number, duration: number) => `${slotToTime(start)}–${slotToTime(start + duration)}`;

  const startRangeSelection = (event: React.PointerEvent<HTMLDivElement>, resource: string) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragSelection({ resource, start: Math.min(16, slotFromPointer(event)), duration: 2 });
  };
  const updateRangeSelection = (event: React.PointerEvent<HTMLDivElement>, resource: string) => {
    if (!dragSelection || dragSelection.resource !== resource || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    const slot = slotFromPointer(event);
    const duration = Math.max(2, Math.min(4, Math.abs(slot - dragSelection.start) + 1));
    const start = Math.min(18 - duration, Math.min(dragSelection.start, slot));
    setDragSelection({ resource, start, duration });
  };
  const finishRangeSelection = (event: React.PointerEvent<HTMLDivElement>, resource: string) => {
    if (!dragSelection || dragSelection.resource !== resource) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    const duration = dragSelection.duration;
    const service = duration >= 4 ? "แพ็กเกจ 120 นาที" : duration === 3 ? "นวดไทย 90 นาที" : "นวดไทย 60 นาที";
    setBookingDraft({ ...blankBooking, service, time: slotToTime(dragSelection.start), [resourceView]: resource });
    setDragSelection(null);
  };
  const dropBooking = (event: React.DragEvent<HTMLDivElement>, resource: string) => {
    event.preventDefault();
    if (draggedBookingId === null) return;
    const booking = timelineBookings.find((item) => item.id === draggedBookingId);
    if (!booking) return;
    const start = Math.min(18 - booking.duration, slotFromPointer(event));
    setTimelineBookings((current) => current.map((booking) =>
      booking.id === draggedBookingId
        ? { ...booking, [resourceView]: resource, start, time: bookingTime(start, booking.duration) }
        : booking,
    ));
    setDraggedBookingId(null);
  };

  const saveBooking = () => {
    if (!bookingDraft?.customer.trim()) return;
    const [hour, minute] = bookingDraft.time.split(":").map(Number);
    const start = Math.max(0, Math.min(17, (hour - 9) * 2 + (minute >= 30 ? 1 : 0)));
    const duration = bookingDraft.service.includes("120") ? 4 : bookingDraft.service.includes("90") ? 3 : 2;
    const endMinutes = hour * 60 + minute + duration * 30;
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, "0")}:${String(endMinutes % 60).padStart(2, "0")}`;
    setTimelineBookings((current) => [...current, {
      id: Math.max(0, ...current.map((booking) => booking.id)) + 1,
      customer: bookingDraft.customer,
      service: bookingDraft.service,
      staff: bookingDraft.staff,
      room: bookingDraft.room,
      start,
      duration,
      time: `${bookingDraft.time}–${end}`,
      status: bookingDraft.status,
    }]);
    setBookingDraft(null);
  };

  return (
    <section className="timeline-page">
      <div className="timeline-toolbar">
        <div className="resource-switch"><button className="active"><Icon name="users" size={17} /> ตารางคิวพนักงาน</button></div>
        <div className="timeline-date"><button onClick={() => setSelectedDay((day) => day - 1)}>‹</button><div><span>วันพุธ</span><strong>{selectedDay} มิถุนายน 2568</strong></div><button onClick={() => setSelectedDay((day) => day + 1)}>›</button><button onClick={() => setSelectedDay(18)}>วันนี้</button></div>
        <button className="new-booking" onClick={() => setBookingDraft({ ...blankBooking })}><Icon name="plus" /> จองคิวใหม่</button>
      </div>

      <div className="timeline-summary">
        <span><b>{timelineBookings.length}</b> คิวทั้งหมด</span><span><i className="reserved" /> จองแล้ว {timelineBookings.filter((booking) => booking.status === "reserved").length}</span><span><i className="started" /> เริ่มแล้ว {timelineBookings.filter((booking) => booking.status === "started").length}</span><span><i className="waiting" /> ถึงเวลาเริ่ม {timelineBookings.filter((booking) => booking.status === "waiting").length}</span><span><i className="done" /> เสร็จแล้ว {timelineBookings.filter((booking) => booking.status === "done").length}</span>
      </div>

      <div className="resource-timeline">
        <div className="timeline-corner"><span>THERAPIST</span><strong>พนักงานวันนี้</strong></div>
        <div className="timeline-times">{timeLabels.map((time) => <span key={time}>{time}</span>)}</div>
        <div className="resource-list">
          {resources.map((resource, index) => <div className="resource-person" key={resource.name}><div className={`resource-avatar tone-${index}`}>{resource.name.slice(0, 1)}</div><div><strong>{resource.name}</strong><span>{resource.detail}</span></div><i className={index === 4 ? "away" : ""} /></div>)}
        </div>
        <div className="timeline-board">
          <div className="now-line"><span>14:20</span></div>
          {resources.map((resource) => (
            <div
              className={`timeline-row ${draggedBookingId !== null ? "drop-ready" : ""}`}
              key={resource.name}
              onPointerDown={(event) => startRangeSelection(event, resource.name)}
              onPointerMove={(event) => updateRangeSelection(event, resource.name)}
              onPointerUp={(event) => finishRangeSelection(event, resource.name)}
              onPointerCancel={() => setDragSelection(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => dropBooking(event, resource.name)}
            >
              <div className="half-hour-grid">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
              {dragSelection?.resource === resource.name && <div className={`drag-selection slot-${dragSelection.start} duration-${dragSelection.duration}`}><span>{bookingTime(dragSelection.start, dragSelection.duration)}</span></div>}
              {timelineBookings.filter((booking) => booking[resourceView] === resource.name).map((booking) => (
                <button
                  draggable
                  className={`timeline-event ${booking.status} slot-${booking.start} duration-${booking.duration} ${draggedBookingId === booking.id ? "dragging" : ""}`}
                  key={booking.id}
                  onPointerDown={(event) => event.stopPropagation()}
                  onDragStart={(event) => { setDraggedBookingId(booking.id); event.dataTransfer.effectAllowed = "move"; }}
                  onDragEnd={() => setDraggedBookingId(null)}
                >
                  <strong>{booking.service}</strong>
                  <span><Icon name="user" size={11} /> {booking.customer}</span>
                  <small>{booking.time}<b>{statusLabel[booking.status]}</b></small>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      <p className="timeline-tip">ลากบนช่องว่างเพื่อเลือกช่วงเวลาและจองคิว · ลากบล็อกคิวเพื่อย้ายเวลา พนักงาน หรือห้อง</p>

      {bookingDraft && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setBookingDraft(null)}>
        <div className="booking-modal">
          <button className="modal-close" onClick={() => setBookingDraft(null)}><Icon name="close" /></button>
          <p className="eyebrow">NEW BOOKING</p><h2>จองคิวใหม่</h2><span className="modal-subtitle">กรอกข้อมูลการจองและจัดสรรพนักงานกับห้อง</span>
          <div className="booking-form">
            <label className="full"><span>ชื่อลูกค้า</span><input autoFocus value={bookingDraft.customer} onChange={(event) => setBookingDraft({ ...bookingDraft, customer: event.target.value })} placeholder="ค้นหาหรือเพิ่มชื่อลูกค้า" /></label>
            <label className="full"><span>บริการ</span><select value={bookingDraft.service} onChange={(event) => setBookingDraft({ ...bookingDraft, service: event.target.value })}><option>นวดไทย 60 นาที</option><option>นวดไทย 90 นาที</option><option>นวดอโรม่า 60 นาที</option><option>นวดอโรม่า 90 นาที</option><option>นวดฝ่าเท้า 60 นาที</option><option>ประคบสมุนไพร 90 นาที</option><option>แพ็กเกจ 120 นาที</option></select></label>
            <label><span>วันที่</span><input type="date" defaultValue="2025-06-18" /></label>
            <label><span>เวลาเริ่ม</span><select value={bookingDraft.time} onChange={(event) => setBookingDraft({ ...bookingDraft, time: event.target.value })}>{timeLabels.slice(0, 18).map((time) => <option key={time}>{time}</option>)}</select></label>
            <label className="full"><span>Therapist</span><select value={bookingDraft.staff} onChange={(event) => setBookingDraft({ ...bookingDraft, staff: event.target.value })}>{["น้ำฝน", "มะลิ", "พลอย", "อรทัย", "จิรา"].map((staff) => <option key={staff}>{staff}</option>)}</select></label>
            <label className="full"><span>สถานะ</span><div className="booking-status-options">{(["reserved", "waiting"] as const).map((status) => <button className={bookingDraft.status === status ? "active" : ""} onClick={() => setBookingDraft({ ...bookingDraft, status })} key={status}><i className={status} />{status === "reserved" ? "ยืนยันการจอง" : "รอ Check-in"}</button>)}</div></label>
          </div>
          <div className="booking-modal-actions"><button onClick={() => setBookingDraft(null)}>ยกเลิก</button><button disabled={!bookingDraft.customer.trim()} onClick={saveBooking}><Icon name="calendar" size={16} /> ยืนยันการจอง</button></div>
        </div>
      </div>}
    </section>
  );
}

type RoomStatus = "available" | "busy" | "booked" | "cleaning" | "disabled";
type Room = {
  id: number;
  name: string;
  type: string;
  capacity: number;
  status: RoomStatus;
  therapist: string;
  customer: string;
  time: string;
};

const initialRooms: Room[] = [
  { id: 1, name: "ห้อง 01", type: "ห้องนวดไทย", capacity: 2, status: "busy", therapist: "น้ำฝน", customer: "วราภรณ์ สุขใจ", time: "เหลือ 35 นาที" },
  { id: 2, name: "ห้อง 02", type: "ห้องอโรมา", capacity: 1, status: "booked", therapist: "พลอย", customer: "ศิริพร แสงทอง", time: "14:30 น." },
  { id: 3, name: "ห้อง 03", type: "ห้องนวดไทย", capacity: 2, status: "available", therapist: "", customer: "", time: "พร้อมให้บริการ" },
  { id: 4, name: "ห้อง 04", type: "ห้องอโรมา", capacity: 1, status: "cleaning", therapist: "แม่บ้านอร", customer: "", time: "เสร็จใน 10 นาที" },
  { id: 5, name: "ห้อง 05", type: "ห้องนวดเท้า", capacity: 3, status: "available", therapist: "", customer: "", time: "พร้อมให้บริการ" },
  { id: 6, name: "ห้อง 06", type: "ห้องนวดไทย", capacity: 2, status: "busy", therapist: "มะลิ", customer: "กิตติพงษ์ วัฒนา", time: "เหลือ 50 นาที" },
  { id: 7, name: "ห้อง 07", type: "ห้องอโรมา", capacity: 1, status: "available", therapist: "", customer: "", time: "พร้อมให้บริการ" },
  { id: 8, name: "ห้อง 08", type: "ห้อง VIP", capacity: 2, status: "booked", therapist: "น้ำฝน", customer: "พรทิพย์ สวัสดี", time: "15:30 น." },
  { id: 9, name: "ห้อง 09", type: "ห้องนวดไทย", capacity: 2, status: "disabled", therapist: "", customer: "", time: "ซ่อมเครื่องปรับอากาศ" },
  { id: 10, name: "เตียง A1", type: "เตียงนวดเท้า", capacity: 1, status: "busy", therapist: "อรทัย", customer: "Rachel M.", time: "เหลือ 20 นาที" },
];

const roomStatuses: { id: "all" | RoomStatus; label: string }[] = [
  { id: "all", label: "Room Board" },
  { id: "available", label: "ห้องว่าง" },
  { id: "busy", label: "กำลังให้บริการ" },
  { id: "booked", label: "จองแล้ว" },
  { id: "cleaning", label: "กำลังทำความสะอาด" },
  { id: "disabled", label: "ปิดใช้งาน" },
];

const roomStatusLabels: Record<RoomStatus, string> = {
  available: "ว่าง",
  busy: "กำลังให้บริการ",
  booked: "จองแล้ว",
  cleaning: "กำลังทำความสะอาด",
  disabled: "ปิดใช้งาน",
};

function RoomsBoard() {
  const emptyRoom: Room = { id: 0, name: "", type: "ห้องนวดไทย", capacity: 1, status: "available", therapist: "", customer: "", time: "พร้อมให้บริการ" };
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [filter, setFilter] = useState<"all" | RoomStatus>("all");
  const [query, setQuery] = useState("");
  const [roomDraft, setRoomDraft] = useState<Room | null>(null);
  const filteredRooms = rooms.filter((room) =>
    (filter === "all" || room.status === filter) &&
    `${room.name} ${room.type}`.toLowerCase().includes(query.toLowerCase()),
  );
  const count = (status: RoomStatus) => rooms.filter((room) => room.status === status).length;

  const saveRoom = () => {
    if (!roomDraft?.name.trim()) return;
    if (roomDraft.id) {
      setRooms((current) => current.map((room) => room.id === roomDraft.id ? roomDraft : room));
    } else {
      setRooms((current) => [...current, { ...roomDraft, id: Math.max(0, ...current.map((room) => room.id)) + 1 }]);
    }
    setRoomDraft(null);
  };

  return (
    <section className="rooms-page">
      <div className="rooms-summary">
        <div className="rooms-summary-copy"><p>ROOM MANAGEMENT</p><h2>Room Board</h2><span>ติดตามและจัดการสถานะห้องแบบเรียลไทม์</span></div>
        <div className="room-metrics">
          <div><i className="available" /><span>ว่าง</span><strong>{count("available")}</strong></div>
          <div><i className="busy" /><span>ให้บริการ</span><strong>{count("busy")}</strong></div>
          <div><i className="booked" /><span>จองแล้ว</span><strong>{count("booked")}</strong></div>
          <div><i className="cleaning" /><span>ทำความสะอาด</span><strong>{count("cleaning")}</strong></div>
        </div>
      </div>

      <div className="room-controls">
        <div className="room-search"><Icon name="search" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาห้องหรือประเภท..." /></div>
        <div className="room-filter-tabs">
          {roomStatuses.map((status) => <button className={filter === status.id ? "active" : ""} onClick={() => setFilter(status.id)} key={status.id}>{status.label}<b>{status.id === "all" ? rooms.length : count(status.id)}</b></button>)}
        </div>
        <button className="add-room" onClick={() => setRoomDraft({ ...emptyRoom })}><Icon name="plus" size={17} /> เพิ่มห้อง</button>
      </div>

      <div className="room-board-grid">
        {filteredRooms.map((room) => (
          <article className={`room-board-card ${room.status}`} key={room.id}>
            <div className="room-card-top">
              <div className="room-symbol"><Icon name="door" /></div>
              <span className={`room-status ${room.status}`}><i />{roomStatusLabels[room.status]}</span>
              <button onClick={() => setRoomDraft({ ...room })} title="แก้ไขห้อง"><Icon name="edit" size={16} /></button>
            </div>
            <h3>{room.name}</h3>
            <p>{room.type} · {room.capacity} {room.type.includes("เตียง") ? "ที่" : "เตียง"}</p>
            {room.status === "busy" || room.status === "booked" ? (
              <div className="room-occupant"><span><Icon name="user" size={14} /> {room.customer}</span><span><Icon name="clock" size={14} /> {room.time}</span></div>
            ) : <div className="room-placeholder"><span>{room.time}</span></div>}
            <div className="room-card-bottom">
              <span>{room.therapist ? `Therapist: ${room.therapist}` : "ยังไม่ระบุ Therapist"}</span>
              <button onClick={() => setRoomDraft({ ...room })}>จัดการ</button>
            </div>
          </article>
        ))}
        {!filteredRooms.length && <div className="rooms-empty"><div><Icon name="door" size={28} /></div><strong>ไม่พบห้อง</strong><span>ลองเปลี่ยนตัวกรองหรือคำค้นหา</span></div>}
      </div>

      {roomDraft && (
        <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setRoomDraft(null)}>
          <div className="room-modal">
            <button className="modal-close" onClick={() => setRoomDraft(null)}><Icon name="close" /></button>
            <p className="eyebrow">{roomDraft.id ? "EDIT ROOM" : "NEW ROOM"}</p>
            <h2>{roomDraft.id ? "แก้ไขข้อมูลห้อง" : "เพิ่มห้อง / เตียง"}</h2>
            <div className="room-form">
              <label className="full"><span>ชื่อห้อง / เตียง</span><input autoFocus value={roomDraft.name} onChange={(event) => setRoomDraft({ ...roomDraft, name: event.target.value })} placeholder="เช่น ห้อง 10" /></label>
              <label><span>ประเภท</span><select value={roomDraft.type} onChange={(event) => setRoomDraft({ ...roomDraft, type: event.target.value })}><option>ห้องนวดไทย</option><option>ห้องอโรมา</option><option>ห้องนวดเท้า</option><option>ห้อง VIP</option><option>เตียงนวดเท้า</option></select></label>
              <label><span>จำนวนเตียง</span><input type="number" min="1" max="10" value={roomDraft.capacity} onChange={(event) => setRoomDraft({ ...roomDraft, capacity: Number(event.target.value) })} /></label>
              <label className="full"><span>สถานะ</span><select value={roomDraft.status} onChange={(event) => setRoomDraft({ ...roomDraft, status: event.target.value as RoomStatus })}>{roomStatuses.slice(1).map((status) => <option value={status.id} key={status.id}>{status.label}</option>)}</select></label>
              <label><span>Therapist / ผู้ดูแล</span><input value={roomDraft.therapist} onChange={(event) => setRoomDraft({ ...roomDraft, therapist: event.target.value })} placeholder="ไม่บังคับ" /></label>
              <label><span>ชื่อลูกค้า</span><input value={roomDraft.customer} onChange={(event) => setRoomDraft({ ...roomDraft, customer: event.target.value })} placeholder="ไม่บังคับ" /></label>
              <label className="full"><span>หมายเหตุ / เวลา</span><input value={roomDraft.time} onChange={(event) => setRoomDraft({ ...roomDraft, time: event.target.value })} placeholder="เช่น พร้อมให้บริการ" /></label>
            </div>
            <div className="room-modal-actions"><button onClick={() => setRoomDraft(null)}>ยกเลิก</button><button disabled={!roomDraft.name.trim()} onClick={saveRoom}><Icon name="check" size={16} /> บันทึกข้อมูล</button></div>
          </div>
        </div>
      )}
    </section>
  );
}

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  visits: number;
  spend: number;
  points: number;
  tag: "VIP" | "สมาชิก" | "ลูกค้าใหม่" | "ทั่วไป";
  lastVisit: string;
};

const initialCustomers: Customer[] = [
  { id: 1, name: "วราภรณ์ สุขใจ", phone: "089-245-7812", email: "waraporn@email.com", visits: 18, spend: 14850, points: 1280, tag: "VIP", lastVisit: "วันนี้, 10:30" },
  { id: 2, name: "ศิริพร แสงทอง", phone: "081-639-4420", email: "siriporn@email.com", visits: 9, spend: 7200, points: 640, tag: "สมาชิก", lastVisit: "วันนี้, 14:30" },
  { id: 3, name: "กิตติพงษ์ วัฒนา", phone: "095-826-1033", email: "kittipong@email.com", visits: 6, spend: 4950, points: 410, tag: "สมาชิก", lastVisit: "16 มิ.ย. 2568" },
  { id: 4, name: "พรทิพย์ สวัสดี", phone: "086-772-9015", email: "porntip@email.com", visits: 13, spend: 10200, points: 920, tag: "VIP", lastVisit: "14 มิ.ย. 2568" },
  { id: 5, name: "Rachel Morgan", phone: "092-451-6830", email: "rachel.m@email.com", visits: 2, spend: 1500, points: 120, tag: "ลูกค้าใหม่", lastVisit: "12 มิ.ย. 2568" },
  { id: 6, name: "ธนกร วงศ์สวัสดิ์", phone: "084-519-2276", email: "thanakorn@email.com", visits: 4, spend: 3100, points: 260, tag: "ทั่วไป", lastVisit: "10 มิ.ย. 2568" },
  { id: 7, name: "นภัสสร มีสุข", phone: "099-265-7318", email: "napatsorn@email.com", visits: 1, spend: 550, points: 55, tag: "ลูกค้าใหม่", lastVisit: "8 มิ.ย. 2568" },
];

function TablePagination({ page, pageSize, total, onChange }: { page: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total ? (page - 1) * pageSize + 1 : 0;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="table-pagination">
      <span>แสดง {start}–{end} จาก {total} รายการ</span>
      <div>
        <button disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="หน้าก่อนหน้า">‹</button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => <button className={page === pageNumber ? "active" : ""} onClick={() => onChange(pageNumber)} key={pageNumber}>{pageNumber}</button>)}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="หน้าถัดไป">›</button>
      </div>
    </div>
  );
}

function CustomerManagement() {
  const blankCustomer: Customer = { id: 0, name: "", phone: "", email: "", visits: 0, spend: 0, points: 0, tag: "ลูกค้าใหม่", lastVisit: "ยังไม่เคยใช้บริการ" };
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("ทั้งหมด");
  const [customerDraft, setCustomerDraft] = useState<Customer | null>(null);
  const [customerPage, setCustomerPage] = useState(1);
  const customerPageSize = 5;
  const filteredCustomers = customers.filter((customer) =>
    (tagFilter === "ทั้งหมด" || customer.tag === tagFilter) &&
    `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(query.toLowerCase()),
  );
  const customerTotalPages = Math.max(1, Math.ceil(filteredCustomers.length / customerPageSize));
  const safeCustomerPage = Math.min(customerPage, customerTotalPages);
  const visibleCustomers = filteredCustomers.slice((safeCustomerPage - 1) * customerPageSize, safeCustomerPage * customerPageSize);

  const saveCustomer = () => {
    if (!customerDraft?.name.trim() || !customerDraft.phone.trim()) return;
    if (customerDraft.id) {
      setCustomers((current) => current.map((customer) => customer.id === customerDraft.id ? customerDraft : customer));
    } else {
      setCustomers((current) => [{ ...customerDraft, id: Math.max(0, ...current.map((customer) => customer.id)) + 1 }, ...current]);
    }
    setCustomerDraft(null);
  };

  return (
    <section className="customers-page">
      <div className="customer-overview">
        <div><div className="customer-overview-icon"><Icon name="users" size={27} /></div><span>ลูกค้าทั้งหมด</span><strong>{customers.length.toLocaleString()} <small>คน</small></strong><p>เพิ่มขึ้น 12 คนในเดือนนี้</p></div>
        <div><div className="customer-overview-icon"><Icon name="user" size={25} /></div><span>สมาชิก</span><strong>{customers.filter((customer) => customer.tag === "สมาชิก" || customer.tag === "VIP").length} <small>คน</small></strong><p>คิดเป็น 71% ของลูกค้าทั้งหมด</p></div>
        <div><div className="customer-overview-icon">P</div><span>คะแนนสะสมรวม</span><strong>{customers.reduce((sum, customer) => sum + customer.points, 0).toLocaleString()}</strong><p>คะแนนที่ลูกค้ายังไม่ได้ใช้</p></div>
      </div>

      <div className="customer-panel">
        <div className="customer-panel-head">
          <div><h2>รายชื่อลูกค้า</h2><p>จัดการข้อมูล ประวัติ และสิทธิประโยชน์ของลูกค้า</p></div>
          <button onClick={() => setCustomerDraft({ ...blankCustomer })}><Icon name="plus" size={17} /> เพิ่มลูกค้า</button>
        </div>
        <div className="customer-tools">
          <div className="customer-search"><Icon name="search" size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setCustomerPage(1); }} placeholder="ค้นหาชื่อ เบอร์โทร หรืออีเมล..." /></div>
          <div className="customer-filters">{["ทั้งหมด", "VIP", "สมาชิก", "ลูกค้าใหม่", "ทั่วไป"].map((tag) => <button className={tagFilter === tag ? "active" : ""} onClick={() => { setTagFilter(tag); setCustomerPage(1); }} key={tag}>{tag}</button>)}</div>
          <span>{filteredCustomers.length} รายการ</span>
        </div>
        <div className="customer-table-wrap">
          <table className="customer-table">
            <thead><tr><th>ลูกค้า</th><th>ติดต่อ</th><th>ประเภท</th><th>เข้าใช้บริการ</th><th>ยอดใช้จ่าย</th><th>Point</th><th>ล่าสุด</th><th /></tr></thead>
            <tbody>
              {visibleCustomers.map((customer, index) => (
                <tr key={customer.id}>
                  <td><div className={`customer-avatar color-${index % 5}`}>{customer.name.slice(0, 1)}</div><div><strong>{customer.name}</strong><span>CM-{String(customer.id).padStart(4, "0")}</span></div></td>
                  <td><strong>{customer.phone}</strong><span>{customer.email || "ไม่ระบุอีเมล"}</span></td>
                  <td><i className={`customer-tag ${customer.tag === "ลูกค้าใหม่" ? "new" : customer.tag === "ทั่วไป" ? "normal" : customer.tag.toLowerCase()}`}>{customer.tag}</i></td>
                  <td><strong>{customer.visits} ครั้ง</strong></td>
                  <td><strong>฿{customer.spend.toLocaleString()}</strong></td>
                  <td><strong className="customer-points">{customer.points.toLocaleString()}</strong></td>
                  <td><span>{customer.lastVisit}</span></td>
                  <td><button onClick={() => setCustomerDraft({ ...customer })} title="แก้ไขลูกค้า"><Icon name="edit" size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filteredCustomers.length && <div className="customer-empty"><div><Icon name="users" /></div><strong>ไม่พบลูกค้า</strong><span>ลองเปลี่ยนตัวกรองหรือคำค้นหา</span></div>}
        </div>
        <TablePagination page={safeCustomerPage} pageSize={customerPageSize} total={filteredCustomers.length} onChange={setCustomerPage} />
      </div>

      {customerDraft && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setCustomerDraft(null)}>
        <div className="customer-modal">
          <button className="modal-close" onClick={() => setCustomerDraft(null)}><Icon name="close" /></button>
          <p className="eyebrow">{customerDraft.id ? "EDIT CUSTOMER" : "NEW CUSTOMER"}</p>
          <h2>{customerDraft.id ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}</h2>
          <span className="modal-subtitle">ข้อมูลนี้จะใช้สำหรับการจอง บันทึกประวัติ และสะสมคะแนน</span>
          <div className="customer-form">
            <label className="full"><span>ชื่อ–นามสกุล *</span><input autoFocus value={customerDraft.name} onChange={(event) => setCustomerDraft({ ...customerDraft, name: event.target.value })} placeholder="กรอกชื่อและนามสกุล" /></label>
            <label><span>เบอร์โทรศัพท์ *</span><input value={customerDraft.phone} onChange={(event) => setCustomerDraft({ ...customerDraft, phone: event.target.value })} placeholder="08X-XXX-XXXX" /></label>
            <label><span>อีเมล</span><input type="email" value={customerDraft.email} onChange={(event) => setCustomerDraft({ ...customerDraft, email: event.target.value })} placeholder="customer@email.com" /></label>
            <label><span>ประเภทลูกค้า</span><select value={customerDraft.tag} onChange={(event) => setCustomerDraft({ ...customerDraft, tag: event.target.value as Customer["tag"] })}><option>ลูกค้าใหม่</option><option>ทั่วไป</option><option>สมาชิก</option><option>VIP</option></select></label>
            <label><span>Point เริ่มต้น</span><input type="number" min="0" value={customerDraft.points} onChange={(event) => setCustomerDraft({ ...customerDraft, points: Number(event.target.value) })} /></label>
            <label className="full"><span>หมายเหตุ</span><textarea placeholder="เช่น แพ้น้ำมันบางชนิด หรือต้องการ Therapist หญิง" /></label>
          </div>
          <div className="customer-modal-actions"><button onClick={() => setCustomerDraft(null)}>ยกเลิก</button><button disabled={!customerDraft.name.trim() || !customerDraft.phone.trim()} onClick={saveCustomer}><Icon name="check" size={16} /> {customerDraft.id ? "บันทึกการแก้ไข" : "เพิ่มลูกค้า"}</button></div>
        </div>
      </div>}
    </section>
  );
}

type ManageRecord = {
  id: number;
  name: string;
  code: string;
  category: string;
  status: "active" | "pending" | "inactive";
  detail: string;
  value: string;
  date: string;
};

const managementConfigs: Record<string, {
  title: string; description: string; noun: string; primaryLabel: string; secondaryLabel: string; readOnly?: boolean; records: ManageRecord[];
}> = {
  therapists: {
    title: "Therapist / พนักงาน", description: "จัดการพนักงาน ทักษะ ตารางงาน และค่าคอมมิชชั่น", noun: "พนักงาน", primaryLabel: "ความสามารถ", secondaryLabel: "ค่ามือ",
    records: [
      { id: 1, name: "น้ำฝน พรหมรักษ์", code: "TH-001", category: "นวดไทย · อโรมา", status: "active", detail: "เข้างาน 09:45 น.", value: "฿6,850", date: "คิววันนี้ 5" },
      { id: 2, name: "มะลิ ใจดี", code: "TH-002", category: "นวดไทย · สมุนไพร", status: "active", detail: "เข้างาน 09:52 น.", value: "฿7,240", date: "คิววันนี้ 4" },
      { id: 3, name: "พลอย วัฒนสุข", code: "TH-003", category: "อโรมา · สครับ", status: "active", detail: "เข้างาน 10:05 น.", value: "฿5,920", date: "คิววันนี้ 4" },
      { id: 4, name: "อรทัย แสงทอง", code: "TH-004", category: "นวดเท้า · นวดไทย", status: "pending", detail: "ลาครึ่งวัน", value: "฿4,780", date: "คิววันนี้ 2" },
    ],
  },
  packages: {
    title: "Package / Course", description: "จัดการแพ็กเกจ คอร์ส และสิทธิ์คงเหลือของลูกค้า", noun: "Package", primaryLabel: "จำนวนครั้ง", secondaryLabel: "ราคา",
    records: [
      { id: 1, name: "Thai Massage Wellness", code: "PK-001", category: "นวดไทย 60 นาที · 10 ครั้ง", status: "active", detail: "ขายแล้ว 48 ชุด", value: "฿3,150", date: "อายุ 180 วัน" },
      { id: 2, name: "Aroma Relax Course", code: "PK-002", category: "นวดอโรมา 90 นาที · 5 ครั้ง", status: "active", detail: "ขายแล้ว 31 ชุด", value: "฿3,375", date: "อายุ 120 วัน" },
      { id: 3, name: "Office Syndrome Care", code: "PK-003", category: "นวดบำบัด 60 นาที · 6 ครั้ง", status: "pending", detail: "ขายแล้ว 17 ชุด", value: "฿2,790", date: "อายุ 90 วัน" },
    ],
  },
  promotions: {
    title: "Promotion", description: "สร้างส่วนลด Voucher และ Campaign สำหรับลูกค้า", noun: "Promotion", primaryLabel: "เงื่อนไข", secondaryLabel: "ส่วนลด",
    records: [
      { id: 1, name: "Happy Hour ก่อนบ่ายสอง", code: "PR-001", category: "จันทร์–ศุกร์ ก่อน 14:00", status: "active", detail: "ใช้แล้ว 126 ครั้ง", value: "15%", date: "ถึง 30 มิ.ย. 68" },
      { id: 2, name: "สมาชิกใหม่", code: "PR-002", category: "ใช้บริการครั้งแรก", status: "active", detail: "ใช้แล้ว 82 ครั้ง", value: "฿100", date: "ไม่มีกำหนด" },
      { id: 3, name: "วันเกิดสุขใจ", code: "VC-008", category: "Voucher เดือนเกิด", status: "pending", detail: "ส่งแล้ว 45 ใบ", value: "20%", date: "ถึง 31 ธ.ค. 68" },
    ],
  },
  inventory: {
    title: "สินค้า / Inventory", description: "ติดตามสินค้า วัตถุดิบ และความเคลื่อนไหวของ Stock", noun: "สินค้า", primaryLabel: "คงเหลือ", secondaryLabel: "มูลค่า",
    records: [
      { id: 1, name: "น้ำมันอโรมา Lavender", code: "ST-001", category: "น้ำมันนวด · 1 ลิตร", status: "active", detail: "คงเหลือ 18 ขวด", value: "฿8,100", date: "ขั้นต่ำ 6" },
      { id: 2, name: "ลูกประคบสมุนไพร", code: "ST-002", category: "อุปกรณ์บริการ", status: "pending", detail: "คงเหลือ 7 ลูก", value: "฿1,050", date: "ต่ำกว่ากำหนด" },
      { id: 3, name: "ผ้าขนหนูสีขาว", code: "ST-003", category: "ของใช้สิ้นเปลือง", status: "active", detail: "คงเหลือ 64 ผืน", value: "฿5,760", date: "ขั้นต่ำ 20" },
      { id: 4, name: "เกลือสครับผิว", code: "ST-004", category: "ผลิตภัณฑ์สปา · 500 กรัม", status: "inactive", detail: "สินค้าหมด", value: "฿0", date: "รอรับสินค้า" },
    ],
  },
  finance: {
    title: "การเงิน", description: "ตรวจสอบรายการขาย การรับเงิน กะ และการปิดยอดประจำวัน", noun: "รายการ", primaryLabel: "ช่องทาง", secondaryLabel: "ยอดเงิน",
    records: [
      { id: 1, name: "บิล #A-0284", code: "TX-250618-01", category: "QR พร้อมเพย์", status: "active", detail: "นวดอโรม่า · นวดเท้า", value: "฿950", date: "วันนี้ 14:42" },
      { id: 2, name: "บิล #A-0283", code: "TX-250618-02", category: "เงินสด", status: "active", detail: "นวดไทย 90 นาที", value: "฿500", date: "วันนี้ 13:18" },
      { id: 3, name: "Refund #R-0012", code: "RF-250618-01", category: "คืนเงินผ่านบัตร", status: "pending", detail: "ยกเลิกก่อนรับบริการ", value: "−฿750", date: "วันนี้ 11:05" },
    ],
  },
  reports: {
    title: "Reports", description: "รายงานเชิงลึกสำหรับติดตามผลการดำเนินงานของร้าน", noun: "รายงาน", primaryLabel: "ช่วงข้อมูล", secondaryLabel: "อัปเดตล่าสุด", readOnly: true,
    records: [
      { id: 1, name: "Sales Report", code: "RPT-001", category: "ยอดขายตามวัน บริการ และสาขา", status: "active", detail: "ข้อมูล 1,248 รายการ", value: "฿428,500", date: "5 นาทีที่แล้ว" },
      { id: 2, name: "Therapist Performance", code: "RPT-002", category: "ผลงาน ค่ามือ และคะแนนรีวิว", status: "active", detail: "พนักงาน 12 คน", value: "4.8 / 5", date: "วันนี้ 09:00" },
      { id: 3, name: "Package Report", code: "RPT-003", category: "ยอดขายและสิทธิ์ Package", status: "active", detail: "Package ใช้งาน 96 ชุด", value: "฿186,200", date: "วันนี้ 09:00" },
      { id: 4, name: "Inventory Report", code: "RPT-004", category: "Stock Movement และต้นทุน", status: "active", detail: "สินค้า 84 รายการ", value: "฿92,450", date: "เมื่อวาน" },
    ],
  },
  analytics: {
    title: "Dashboard / Analytics", description: "วิเคราะห์แนวโน้มยอดขาย บริการ และพฤติกรรมลูกค้า", noun: "Widget", primaryLabel: "Metric", secondaryLabel: "ผลลัพธ์", readOnly: true,
    records: [
      { id: 1, name: "Sales Trend", code: "AN-001", category: "เทียบ 30 วันล่าสุด", status: "active", detail: "เติบโตจากเดือนก่อน", value: "+18.4%", date: "อัปเดตสด" },
      { id: 2, name: "Service Ranking", code: "AN-002", category: "นวดไทย 60 นาที", status: "active", detail: "บริการยอดนิยมอันดับ 1", value: "186 ครั้ง", date: "เดือนนี้" },
      { id: 3, name: "Customer Retention", code: "AN-003", category: "ลูกค้าเก่ากลับมาใช้บริการ", status: "active", detail: "สูงกว่าค่าเฉลี่ย 8%", value: "72%", date: "เดือนนี้" },
      { id: 4, name: "Peak Hour", code: "AN-004", category: "ช่วงเวลาที่มีลูกค้าสูงสุด", status: "active", detail: "ศุกร์–อาทิตย์", value: "16:00–19:00", date: "30 วันล่าสุด" },
    ],
  },
  settings: {
    title: "ตั้งค่า", description: "กำหนดข้อมูลสาขา บริการ ราคา และกฎการทำงาน", noun: "การตั้งค่า", primaryLabel: "หมวดหมู่", secondaryLabel: "สถานะ",
    records: [
      { id: 1, name: "SABAI Massage & Spa", code: "BR-001", category: "สาขาหลัก · กรุงเทพมหานคร", status: "active", detail: "เปิด 10:00–22:00", value: "VAT 7%", date: "แก้ไข 2 วันก่อน" },
      { id: 2, name: "PromptPay QR", code: "PM-001", category: "Payment Method", status: "active", detail: "บัญชีลงท้าย 4582", value: "พร้อมใช้งาน", date: "แก้ไข 1 เดือนก่อน" },
      { id: 3, name: "Commission Rule 2025", code: "CM-001", category: "Commission Rules", status: "active", detail: "ค่ามือ + 10% ยอดขาย", value: "ใช้งานอยู่", date: "เริ่ม 1 ม.ค. 68" },
    ],
  },
  admin: {
    title: "Administration", description: "จัดการผู้ใช้ สิทธิ์การเข้าถึง และประวัติระบบ", noun: "ผู้ใช้งาน", primaryLabel: "Role", secondaryLabel: "เข้าใช้ล่าสุด",
    records: [
      { id: 1, name: "มะลิ ใจดี", code: "USR-001", category: "Owner / Administrator", status: "active", detail: "เข้าถึงทุกโมดูล", value: "Online", date: "ขณะนี้" },
      { id: 2, name: "พิมพ์ชนก วัฒนา", code: "USR-002", category: "Front Desk", status: "active", detail: "POS · Booking · ลูกค้า", value: "Active", date: "วันนี้ 09:38" },
      { id: 3, name: "สมชาย รักษ์ดี", code: "USR-003", category: "Accountant", status: "pending", detail: "การเงิน · Reports", value: "Invited", date: "เชิญเมื่อวาน" },
    ],
  },
};

const featureSamples: Record<string, string[]> = {
  "therapists:Skill / ความสามารถ": ["นวดไทย", "นวดน้ำมันอโรมา", "นวดฝ่าเท้า", "ประคบสมุนไพร"],
  "therapists:ตารางงาน": ["กะเช้า 09:00–18:00", "กะกลาง 11:00–20:00", "กะบ่าย 13:00–22:00"],
  "therapists:Check-in / Check-out": ["น้ำฝน · เข้างาน 09:45", "มะลิ · เข้างาน 09:52", "พลอย · เข้างาน 10:05"],
  "therapists:Commission": ["ค่ามือนวดไทย", "ค่ามือนวดอโรมา", "Commission ขาย Package", "Commission ขายสินค้า"],
  "therapists:สรุปค่ามือ": ["น้ำฝน · มิถุนายน", "มะลิ · มิถุนายน", "พลอย · มิถุนายน", "อรทัย · มิถุนายน"],
  "packages:สร้าง Package": ["Draft · Wellness 10 ครั้ง", "Draft · Office Syndrome", "Draft · Couple Retreat"],
  "packages:Package ลูกค้า": ["วราภรณ์ · Thai Wellness", "ศิริพร · Aroma Relax", "พรทิพย์ · Office Syndrome"],
  "packages:การใช้สิทธิ์": ["ใช้สิทธิ์ #US-1284", "ใช้สิทธิ์ #US-1283", "ใช้สิทธิ์ #US-1282"],
  "packages:วันหมดอายุ": ["หมดอายุใน 7 วัน", "หมดอายุใน 30 วัน", "หมดอายุใน 60 วัน"],
  "promotions:Discount": ["ส่วนลดสมาชิก 10%", "ส่วนลดพนักงาน 20%", "ส่วนลดวันเกิด 15%"],
  "promotions:Voucher": ["Voucher ฿500", "Voucher Aroma 60 นาที", "Gift Card ฿1,000"],
  "promotions:Campaign": ["สงกรานต์สุขใจ", "Mother's Day Retreat", "Year End Wellness"],
  "inventory:Stock": ["น้ำมันอโรมา Lavender", "ลูกประคบสมุนไพร", "ผ้าขนหนูสีขาว", "เกลือสครับผิว"],
  "inventory:รับสินค้า": ["GR-0062 · Aroma Oil", "GR-0061 · ผ้าขนหนู", "GR-0060 · ลูกประคบ"],
  "inventory:ตัด Stock": ["เบิกใช้ห้องอโรมา", "เบิกใช้ห้องนวดไทย", "สินค้าเสียหาย"],
  "inventory:ปรับ Stock": ["ADJ-0028 · ตรวจนับ", "ADJ-0027 · ของแถม", "ADJ-0026 · ชำรุด"],
  "inventory:Stock Movement": ["Movement · น้ำมันอโรมา", "Movement · ลูกประคบ", "Movement · ผ้าขนหนู"],
  "finance:รายการรับเงิน": ["รับเงิน #RC-0284", "รับเงิน #RC-0283", "รับเงิน #RC-0282"],
  "finance:เปิด/ปิดกะ": ["กะเช้า · 18 มิ.ย.", "กะบ่าย · 18 มิ.ย.", "กะปิด · 17 มิ.ย."],
  "finance:Cash Drawer": ["เงินสดตั้งต้น", "เงินสดรับระหว่างกะ", "นำเงินออกจากลิ้นชัก"],
  "finance:Refund": ["Refund #R-0012", "Refund #R-0011", "Refund #R-0010"],
  "finance:Daily Closing": ["ปิดยอด 18 มิ.ย. 2568", "ปิดยอด 17 มิ.ย. 2568", "ปิดยอด 16 มิ.ย. 2568"],
  "reports:Sales Report": ["ยอดขายวันนี้", "ยอดขายสัปดาห์นี้", "ยอดขายเดือนนี้", "ยอดขายแยกตามสาขา"],
  "reports:Service Report": ["นวดไทย 60 นาที", "นวดอโรม่า 90 นาที", "นวดฝ่าเท้า 60 นาที"],
  "reports:Therapist Performance": ["น้ำฝน พรหมรักษ์", "มะลิ ใจดี", "พลอย วัฒนสุข"],
  "reports:Commission Report": ["ค่ามือประจำเดือน", "Commission Package", "Commission สินค้า"],
  "reports:Payment Report": ["QR พร้อมเพย์", "เงินสด", "บัตรเครดิต"],
  "reports:Customer Report": ["ลูกค้าใหม่", "ลูกค้ากลับมาใช้ซ้ำ", "สมาชิก VIP"],
  "reports:Package Report": ["Thai Massage Wellness", "Aroma Relax Course", "Office Syndrome Care"],
  "reports:Inventory Report": ["Stock คงเหลือ", "Stock Movement", "สินค้าต่ำกว่ากำหนด"],
  "reports:Profit / Cost": ["รายได้จากบริการ", "ต้นทุนพนักงาน", "ต้นทุนผลิตภัณฑ์", "กำไรขั้นต้น"],
  "analytics:Sales Trend": ["ยอดขาย 7 วันล่าสุด", "ยอดขาย 30 วันล่าสุด", "ยอดขายเทียบปีก่อน"],
  "analytics:Service Ranking": ["อันดับ 1 · นวดไทย 60 นาที", "อันดับ 2 · นวดอโรมา 90 นาที", "อันดับ 3 · นวดฝ่าเท้า"],
  "analytics:Therapist Performance": ["น้ำฝน · คะแนน 4.9", "มะลิ · คะแนน 4.8", "พลอย · คะแนน 4.8"],
  "analytics:Customer ใหม่ / เก่า": ["ลูกค้าใหม่เดือนนี้", "ลูกค้าเก่ากลับมา", "สมาชิกที่ Active"],
  "analytics:Peak Hour": ["16:00–17:00", "17:00–18:00", "18:00–19:00"],
  "settings:สาขา": ["SABAI สาขาสุขุมวิท", "SABAI สาขาอารีย์", "SABAI สาขาสาทร"],
  "settings:ห้อง / เตียง": ["ห้องนวดไทย", "ห้องอโรมา", "เตียงนวดเท้า", "ห้อง VIP"],
  "settings:Services": ["นวดไทย", "นวดน้ำมันอโรมา", "นวดฝ่าเท้า", "ประคบสมุนไพร"],
  "settings:ราคา": ["ราคาปกติ", "ราคาสมาชิก", "ราคาช่วงเทศกาล"],
  "settings:Therapist": ["ระดับ Junior", "ระดับ Senior", "ระดับ Specialist"],
  "settings:Commission Rules": ["ค่ามือต่อบริการ", "Commission Package", "Commission สินค้า"],
  "settings:Payment Methods": ["เงินสด", "QR พร้อมเพย์", "บัตรเครดิต", "หลายช่องทาง"],
  "settings:Tax / Receipt": ["VAT 7%", "ใบเสร็จรับเงิน", "ใบกำกับภาษีเต็มรูป"],
  "settings:System Settings": ["ภาษาและเขตเวลา", "การแจ้งเตือน", "สำรองข้อมูล", "เลขที่เอกสาร"],
  "admin:Roles / Permissions": ["Owner / Administrator", "Branch Manager", "Front Desk", "Accountant"],
  "admin:Audit Log": ["แก้ไขราคาบริการ", "ยกเลิกบิล #A-0281", "แก้ไขสิทธิ์ผู้ใช้"],
  "admin:System Log": ["Daily backup completed", "User login successful", "Receipt service connected"],
};

function seedFeatureRecords(moduleId: string, feature: string, config: (typeof managementConfigs)[string]): ManageRecord[] {
  const names = featureSamples[`${moduleId}:${feature}`] ?? [`${feature} · รายการ 1`, `${feature} · รายการ 2`, `${feature} · รายการ 3`];
  return names.map((name, index) => ({
    id: index + 1,
    name,
    code: `${moduleId.slice(0, 2).toUpperCase()}-${String(index + 1).padStart(3, "0")}`,
    category: feature,
    status: index === 2 ? "pending" : "active",
    detail: index === 0 ? `ข้อมูล${feature}ล่าสุด` : `รายละเอียด${config.noun} ${index + 1}`,
    value: moduleId === "reports" ? `${(128 - index * 17).toLocaleString()} รายการ` : moduleId === "analytics" ? `${18 - index * 3}.4%` : "พร้อมใช้งาน",
    date: index === 0 ? "อัปเดตวันนี้" : `${index + 1} วันที่แล้ว`,
  }));
}

function ManagementWorkspace({ module }: { module: (typeof modules)[number] }) {
  const config = managementConfigs[module.id];
  const emptyRecord: ManageRecord = { id: 0, name: "", code: "", category: "", status: "active", detail: "", value: "", date: "สร้างเมื่อสักครู่" };
  const [recordsByFeature, setRecordsByFeature] = useState<Record<string, ManageRecord[]>>(() =>
    Object.fromEntries(module.features.map((feature, index) => [
      feature,
      index === 0 && !featureSamples[`${module.id}:${feature}`] ? config.records : seedFeatureRecords(module.id, feature, config),
    ])),
  );
  const [query, setQuery] = useState("");
  const [activeFeature, setActiveFeature] = useState(module.features[0]);
  const [draft, setDraft] = useState<ManageRecord | null>(null);
  const [managementPage, setManagementPage] = useState(1);
  const managementPageSize = 3;
  const records = recordsByFeature[activeFeature] ?? [];
  const filteredRecords = records.filter((record) => `${record.name} ${record.code} ${record.category}`.toLowerCase().includes(query.toLowerCase()));
  const managementTotalPages = Math.max(1, Math.ceil(filteredRecords.length / managementPageSize));
  const safeManagementPage = Math.min(managementPage, managementTotalPages);
  const visibleRecords = filteredRecords.slice((safeManagementPage - 1) * managementPageSize, safeManagementPage * managementPageSize);

  const saveRecord = () => {
    if (!draft?.name.trim()) return;
    setRecordsByFeature((current) => {
      const featureRecords = current[activeFeature] ?? [];
      const nextRecords = draft.id
        ? featureRecords.map((record) => record.id === draft.id ? draft : record)
        : [{ ...draft, id: Math.max(0, ...featureRecords.map((record) => record.id)) + 1 }, ...featureRecords];
      return { ...current, [activeFeature]: nextRecords };
    });
    setDraft(null);
  };

  return (
    <section className="management-page">
      <div className="management-hero">
        <div className="management-hero-icon"><Icon name={module.icon as IconName} size={27} /></div>
        <div><p>MANAGEMENT</p><h2>{config.title}</h2><span>{config.description}</span></div>
        <div className="management-kpis"><div><span>ในแท็บนี้</span><strong>{records.length}</strong></div><div><span>ใช้งาน</span><strong>{records.filter((record) => record.status === "active").length}</strong></div><div><span>รอดำเนินการ</span><strong>{records.filter((record) => record.status === "pending").length}</strong></div></div>
      </div>
      <div className="management-tabs">{module.features.map((feature) => <button className={activeFeature === feature ? "active" : ""} onClick={() => { setActiveFeature(feature); setManagementPage(1); setQuery(""); }} key={feature}>{feature}</button>)}</div>
      <div className="management-panel">
        <div className="management-head">
          <div><h3>{activeFeature}</h3><p>{config.description}</p></div>
          {!config.readOnly && <button onClick={() => setDraft({ ...emptyRecord, code: `${module.id.slice(0, 2).toUpperCase()}-${String(records.length + 1).padStart(3, "0")}` })}><Icon name="plus" size={16} /> เพิ่ม{config.noun}</button>}
        </div>
        <div className="feature-insights">
          <div><span>ภาพรวม {activeFeature}</span><strong>{records.length} <small>รายการ</small></strong></div>
          <div><span>{config.primaryLabel}</span><strong>{records[0]?.category || "ยังไม่มีข้อมูล"}</strong></div>
          <div><span>{config.secondaryLabel}</span><strong>{records[0]?.value || "—"}</strong></div>
        </div>
        <div className="management-tools"><div><Icon name="search" size={17} /><input value={query} onChange={(event) => { setQuery(event.target.value); setManagementPage(1); }} placeholder={`ค้นหา${config.noun}...`} /></div><span>{filteredRecords.length} รายการ</span></div>
        <div className="management-table-wrap">
          <table className="management-table">
            <thead><tr><th>{config.noun}</th><th>{config.primaryLabel}</th><th>รายละเอียด</th><th>{config.secondaryLabel}</th><th>อัปเดต</th><th>สถานะ</th><th /></tr></thead>
            <tbody>{visibleRecords.map((record, index) => <tr key={record.id}><td><div className={`management-item-icon tint-${index % 4}`}><Icon name={module.icon as IconName} size={17} /></div><div><strong>{record.name}</strong><span>{record.code}</span></div></td><td><strong>{record.category}</strong></td><td><span>{record.detail}</span></td><td><strong className="management-value">{record.value}</strong></td><td><span>{record.date}</span></td><td><i className={`management-status ${record.status}`}>{record.status === "active" ? "ใช้งาน" : record.status === "pending" ? "รอดำเนินการ" : "ปิดใช้งาน"}</i></td><td>{config.readOnly ? <button title="เปิดรายงาน">›</button> : <button onClick={() => setDraft({ ...record })} title="แก้ไข"><Icon name="edit" size={15} /></button>}</td></tr>)}</tbody>
          </table>
        </div>
        <TablePagination page={safeManagementPage} pageSize={managementPageSize} total={filteredRecords.length} onChange={setManagementPage} />
      </div>
      {draft && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setDraft(null)}><div className="management-modal">
        <button className="modal-close" onClick={() => setDraft(null)}><Icon name="close" /></button><p className="eyebrow">{draft.id ? "EDIT ITEM" : "NEW ITEM"}</p><h2>{draft.id ? `แก้ไข${config.noun}` : `เพิ่ม${config.noun}`}</h2><span className="modal-subtitle">{config.description}</span>
        <div className="management-form">
          <label className="full"><span>ชื่อ{config.noun} *</span><input autoFocus value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder={`กรอกชื่อ${config.noun}`} /></label>
          <label><span>รหัส</span><input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} /></label>
          <label><span>สถานะ</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as ManageRecord["status"] })}><option value="active">ใช้งาน</option><option value="pending">รอดำเนินการ</option><option value="inactive">ปิดใช้งาน</option></select></label>
          <label className="full"><span>{config.primaryLabel}</span><input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} placeholder={config.primaryLabel} /></label>
          <label><span>รายละเอียด</span><input value={draft.detail} onChange={(event) => setDraft({ ...draft, detail: event.target.value })} /></label>
          <label><span>{config.secondaryLabel}</span><input value={draft.value} onChange={(event) => setDraft({ ...draft, value: event.target.value })} /></label>
        </div>
        <div className="management-modal-actions"><button onClick={() => setDraft(null)}>ยกเลิก</button><button disabled={!draft.name.trim()} onClick={saveRecord}><Icon name="check" size={16} /> บันทึกข้อมูล</button></div>
      </div></div>}
    </section>
  );
}

function ModuleHub({ module }: { module: (typeof modules)[number] }) {
  return (
    <section className="module-page">
      <div className="module-hero"><div className="module-hero-icon"><Icon name={module.icon as IconName} size={28} /></div><div><p>จัดการระบบ</p><h2>{module.label}</h2><span>เลือกเมนูที่ต้องการเพื่อเริ่มจัดการข้อมูล</span></div></div>
      <div className="module-grid">
        {module.features.map((feature, index) => (
          <button key={feature}><div><Icon name={index % 3 === 0 ? "grid" : index % 3 === 1 ? "calendar" : "chart"} /></div><span><strong>{feature}</strong><small>ดูและจัดการ{feature}</small></span><b>›</b></button>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([
    { ...services[2], quantity: 1 },
    { ...services[4], quantity: 1 },
  ]);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paid, setPaid] = useState(false);

  const visibleServices = services.filter(
    (service) =>
      (activeCategory === "ทั้งหมด" || service.category === activeCategory) &&
      service.title.toLowerCase().includes(search.toLowerCase()),
  );
  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const discount = subtotal >= 900 ? 100 : 0;
  const total = subtotal - discount;

  const addToCart = (service: Service) => {
    setCart((current) => {
      const exists = current.find((item) => item.id === service.id);
      return exists
        ? current.map((item) => item.id === service.id ? { ...item, quantity: item.quantity + 1 } : item)
        : [...current, { ...service, quantity: 1 }];
    });
  };

  const changeQuantity = (id: number, difference: number) => {
    setCart((current) =>
      current
        .map((item) => item.id === id ? { ...item, quantity: item.quantity + difference } : item)
        .filter((item) => item.quantity > 0),
    );
  };

  const completePayment = () => {
    setPaid(true);
    window.setTimeout(() => {
      setPaymentOpen(false);
      setPaid(false);
      setCart([]);
    }, 1400);
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sideMenuOpen ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>SABAI</strong><span>Massage & Spa</span></div>
        </div>
        <nav>
          {modules.map((module) => (
            <button className={activeModule === module.id ? "active" : ""} key={module.id} onClick={() => { setActiveModule(module.id); setSideMenuOpen(false); }}>
              <Icon name={module.icon as IconName} /><span>{module.label}</span>
            </button>
          ))}
        </nav>
        <div className="staff-card">
          <div className="avatar">ม</div>
          <div><strong>มะลิ ใจดี</strong><span>ผู้ดูแลร้าน</span></div>
          <span className="online-dot" />
        </div>
      </aside>
      <button className={`sidebar-overlay ${sideMenuOpen ? "open" : ""}`} onClick={() => setSideMenuOpen(false)} aria-label="ปิดเมนู" />

      <main>
        <header>
          <div className="header-title-group">
            <button className="menu-toggle" onClick={() => setSideMenuOpen(true)} aria-label="เปิดเมนู"><Icon name="menu" /></button>
            <div>
              <p className="eyebrow">วันพุธที่ 18 มิถุนายน 2568</p>
              <h1>{modules.find((module) => module.id === activeModule)?.label}</h1>
            </div>
          </div>
          <div className="header-actions">
            <div className="open-status"><i /> เปิดให้บริการ <span>10:00–22:00</span></div>
            <button className="icon-button"><Icon name="bell" /><b>3</b></button>
          </div>
        </header>

        {activeModule === "dashboard" ? <Dashboard onOpenPOS={() => setActiveModule("pos")} /> : activeModule === "booking" ? <BookingCalendar /> : activeModule === "rooms" ? <RoomsBoard /> : activeModule === "customers" ? <CustomerManagement /> : activeModule === "pos" ? <section className="workspace">
          <div className="catalog">
            <div className="catalog-tools">
              <div className="search"><Icon name="search" size={19} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ค้นหาบริการ..." /></div>
              <div className="queue-pill"><span>คิวปัจจุบัน</span><strong>4</strong></div>
            </div>
            <div className="categories">
              {categories.map((category) => (
                <button key={category} className={activeCategory === category ? "active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>
              ))}
            </div>
            <div className="section-heading">
              <div><h2>เลือกบริการ</h2><p>แตะรายการเพื่อเพิ่มลงในบิล</p></div>
              <span>{visibleServices.length} รายการ</span>
            </div>
            <div className="service-grid">
              {visibleServices.map((service) => (
                <button className="service-card" key={service.id} onClick={() => addToCart(service)}>
                  <div className={`service-visual ${service.color}`}>
                    <span className="leaf">⌁</span>
                    <span><Icon name="clock" size={16} /> {service.duration} นาที</span>
                  </div>
                  <div className="service-info">
                    <h3>{service.title}</h3>
                    <p>{service.desc}</p>
                    <div><strong>฿{service.price.toLocaleString()}</strong><i><Icon name="plus" size={17} /></i></div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="order-panel">
            <div className="order-title">
              <div><span>รายการสั่งซื้อ</span><h2>บิล #A-0284</h2></div>
              <button onClick={() => setCart([])} title="ล้างรายการ"><Icon name="trash" size={19} /></button>
            </div>
            <div className="selectors">
              <button><span><Icon name="user" size={18} /> พนักงาน</span><strong>น้ำฝน</strong></button>
              <button><span><Icon name="door" size={18} /> ห้องบริการ</span><strong>ห้อง 03</strong></button>
            </div>
            <div className="cart">
              {cart.length === 0 ? (
                <div className="empty-cart"><div><Icon name="plus" /></div><strong>ยังไม่มีรายการ</strong><span>เลือกบริการจากเมนูด้านซ้าย</span></div>
              ) : cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className={`cart-dot ${item.color}`} />
                  <div className="cart-detail"><strong>{item.title}</strong><span>{item.duration} นาที</span>
                    <div className="stepper">
                      <button onClick={() => changeQuantity(item.id, -1)}><Icon name="minus" size={14} /></button>
                      <b>{item.quantity}</b>
                      <button onClick={() => changeQuantity(item.id, 1)}><Icon name="plus" size={14} /></button>
                    </div>
                  </div>
                  <strong className="item-price">฿{(item.price * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
            </div>
            <div className="summary">
              <div><span>ยอดรวม</span><strong>฿{subtotal.toLocaleString()}</strong></div>
              <div className="discount"><span>ส่วนลดสมาชิก</span><strong>−฿{discount.toLocaleString()}</strong></div>
              <div className="total"><span>ยอดสุทธิ</span><strong>฿{total.toLocaleString()}</strong></div>
              <button className="pay-button" disabled={!cart.length} onClick={() => setPaymentOpen(true)}>
                ชำระเงิน <span>฿{total.toLocaleString()}</span>
              </button>
              <p className="payment-note">รองรับ เงินสด · QR พร้อมเพย์ · บัตรเครดิต</p>
            </div>
          </aside>
        </section> : managementConfigs[activeModule] ? <ManagementWorkspace key={activeModule} module={modules.find((module) => module.id === activeModule) ?? modules[0]} /> : <ModuleHub module={modules.find((module) => module.id === activeModule) ?? modules[0]} />}
      </main>

      {paymentOpen && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setPaymentOpen(false)}>
          <div className="payment-modal">
            {!paid ? (
              <>
                <button className="modal-close" onClick={() => setPaymentOpen(false)}><Icon name="close" /></button>
                <p className="eyebrow">สรุปการชำระเงิน</p>
                <h2>เลือกวิธีชำระเงิน</h2>
                <div className="modal-total"><span>ยอดสุทธิ</span><strong>฿{total.toLocaleString()}</strong></div>
                <div className="payment-options">
                  <button onClick={completePayment}><b>฿</b><span>เงินสด</span></button>
                  <button onClick={completePayment}><b className="qr">▦</b><span>QR พร้อมเพย์</span></button>
                  <button onClick={completePayment}><b>▭</b><span>บัตรเครดิต</span></button>
                </div>
              </>
            ) : (
              <div className="payment-success">
                <div><Icon name="check" size={38} /></div>
                <h2>ชำระเงินสำเร็จ</h2>
                <p>บันทึกรายการและส่งใบเสร็จเรียบร้อยแล้ว</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
