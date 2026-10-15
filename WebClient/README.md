# Massage Platform — หน้าร้าน

Angular 22 application สำหรับงานหน้าร้านนวด เช่น ตารางนัดหมาย บริการ หมอนวด ลูกค้า และสาขา

```powershell
npm install
npm start
```

เปิดใช้งานที่ `http://localhost:4200` ต้องรัน API ที่พอร์ต 5080 ก่อน (`/api` ถูก proxy ผ่าน `proxy.conf.json`) ดูการตั้งค่า API และบัญชีทดลองได้ที่ README หลักของ repository

โครงสร้าง: `src/app/app.*` เป็น shell (login, เมนู, เลือกสาขา) แต่ละเมนูเป็นเพจใน `src/app/pages/` ข้อมูลที่ใช้ร่วมกันอยู่ใน `src/app/core/workspace.store.ts`

```powershell
npm test
npm run build
```
