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
  | "edit";

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
  const [shownMonth, setShownMonth] = useState(new Date(2025, 5, 1));
  const [selectedDate, setSelectedDate] = useState("2025-06-18");
  const [calendarView, setCalendarView] = useState("เดือน");
  const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const month = shownMonth.getMonth();
  const year = shownMonth.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPreviousMonth = new Date(year, month, 0).getDate();
  const cells = Array.from({ length: 42 }, (_, index) => {
    const calendarDate = index - firstDay + 1;
    const date = calendarDate < 1
      ? new Date(year, month - 1, daysInPreviousMonth + calendarDate)
      : calendarDate > daysInMonth
        ? new Date(year, month + 1, calendarDate - daysInMonth)
        : new Date(year, month, calendarDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { date, key, current: date.getMonth() === month };
  });
  const dayBookings = bookingEvents.filter((event) => event.date === selectedDate);
  const selected = new Date(`${selectedDate}T12:00:00`);

  const moveMonth = (difference: number) => {
    const next = new Date(year, month + difference, 1);
    setShownMonth(next);
    setSelectedDate(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`);
  };

  return (
    <section className="booking-page">
      <div className="booking-toolbar">
        <div className="booking-stats">
          <div><span>นัดหมายวันนี้</span><strong>12</strong><small>คิว</small></div>
          <div><span>Check-in แล้ว</span><strong>7</strong><small>คิว</small></div>
          <div><span>รอรับบริการ</span><strong>3</strong><small>คิว</small></div>
        </div>
        <button className="new-booking"><Icon name="plus" /> นัดหมายใหม่</button>
      </div>

      <div className="booking-layout">
        <article className="calendar-card">
          <div className="calendar-head">
            <div className="month-switcher">
              <button onClick={() => moveMonth(-1)}>‹</button>
              <h2>{thaiMonths[month]} {year + 543}</h2>
              <button onClick={() => moveMonth(1)}>›</button>
              <button className="today-button" onClick={() => { setShownMonth(new Date(2025, 5, 1)); setSelectedDate("2025-06-18"); }}>วันนี้</button>
            </div>
            <div className="view-switcher">
              {["เดือน", "สัปดาห์", "วัน"].map((view) => <button className={calendarView === view ? "active" : ""} onClick={() => setCalendarView(view)} key={view}>{view}</button>)}
            </div>
          </div>
          <div className="weekday-row">{["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="calendar-grid">
            {cells.map((cell) => {
              const events = bookingEvents.filter((event) => event.date === cell.key);
              return (
                <button className={`${cell.current ? "" : "outside"} ${selectedDate === cell.key ? "selected" : ""} ${cell.key === "2025-06-18" ? "today" : ""}`} key={cell.key} onClick={() => setSelectedDate(cell.key)}>
                  <span>{cell.date.getDate()}</span>
                  <div className="calendar-events">
                    {events.slice(0, 2).map((event) => <i className={event.status} key={event.id}><b>{event.time}</b> {event.customer}</i>)}
                    {events.length > 2 && <small>+{events.length - 2} นัดหมาย</small>}
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="day-agenda">
          <div className="agenda-heading">
            <span>ตารางนัดหมาย</span>
            <h3>{selected.getDate()} {thaiMonths[selected.getMonth()]}</h3>
            <p>{dayBookings.length} นัดหมาย · {dayBookings.reduce((total, event) => total + (event.service.includes("90") ? 90 : 60), 0)} นาที</p>
          </div>
          <div className="agenda-list">
            {dayBookings.length ? dayBookings.map((event) => (
              <button className="agenda-item" key={event.id}>
                <time>{event.time}</time>
                <div className={`agenda-line ${event.status}`} />
                <div className="agenda-info">
                  <div><strong>{event.customer}</strong><i className={event.status}>{event.status === "checked" ? "Check-in" : event.status === "confirmed" ? "ยืนยันแล้ว" : "รอยืนยัน"}</i></div>
                  <span>{event.service}</span>
                  <small><Icon name="user" size={13} /> {event.therapist}</small>
                </div>
              </button>
            )) : <div className="no-bookings"><div><Icon name="calendar" /></div><strong>ไม่มีนัดหมาย</strong><span>วันนี้ยังไม่มีรายการจอง</span><button><Icon name="plus" size={15} /> เพิ่มนัดหมาย</button></div>}
          </div>
          {dayBookings.length > 0 && <button className="agenda-add"><Icon name="plus" size={16} /> เพิ่มนัดหมายในวันนี้</button>}
        </aside>
      </div>
      <div className="calendar-legend"><span><i className="checked" /> Check-in แล้ว</span><span><i className="confirmed" /> ยืนยันแล้ว</span><span><i className="waiting" /> รอยืนยัน</span></div>
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
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>SABAI</strong><span>Massage & Spa</span></div>
        </div>
        <nav>
          {modules.map((module) => (
            <button className={activeModule === module.id ? "active" : ""} key={module.id} onClick={() => setActiveModule(module.id)}>
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

      <main>
        <header>
          <div>
            <p className="eyebrow">วันพุธที่ 18 มิถุนายน 2568</p>
            <h1>{modules.find((module) => module.id === activeModule)?.label}</h1>
          </div>
          <div className="header-actions">
            <div className="open-status"><i /> เปิดให้บริการ <span>10:00–22:00</span></div>
            <button className="icon-button"><Icon name="bell" /><b>3</b></button>
          </div>
        </header>

        {activeModule === "dashboard" ? <Dashboard onOpenPOS={() => setActiveModule("pos")} /> : activeModule === "booking" ? <BookingCalendar /> : activeModule === "rooms" ? <RoomsBoard /> : activeModule === "pos" ? <section className="workspace">
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
        </section> : <ModuleHub module={modules.find((module) => module.id === activeModule) ?? modules[0]} />}
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
