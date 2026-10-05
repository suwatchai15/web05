# Massage Platform

แพลตฟอร์ม SaaS สำหรับธุรกิจร้านนวด รองรับหลายร้านและหลายสาขาต่อร้าน ใช้ฐานข้อมูล PostgreSQL แยกต่อ tenant

## โครงสร้าง

| โฟลเดอร์ | หน้าที่ |
| --- | --- |
| `WebApi/` | ASP.NET Core Web API บน .NET 10 |
| `WebClient/` | Angular 22 สำหรับจัดการงานภายในร้าน |
| `AdminClient/` | Angular 22 สำหรับผู้ดูแลแพลตฟอร์ม |

## ตั้งค่า API สำหรับ development

PostgreSQL ต้องทำงานอยู่ และ platform catalog database ต้องสร้างไว้ก่อนเริ่ม API บัญชีที่ใช้ใน `TenantDatabase:AdminConnectionString` ต้อง provision tenant databases และรัน migrations ได้

ไฟล์ `WebApi\MassagePlatform.WebApi\appsettings.Development.json` ถูก ignore โดย Git แล้ว เพื่อใช้เก็บค่าพัฒนาบนเครื่องนี้โดยไม่ commit ลง repository เติมค่าเฉพาะในไฟล์ local นี้ ห้ามส่ง connection string, password, signing key หรือ password hash ผ่านแชต:

ถ้านำค่าจาก config ของ web02 มาเป็นต้นทาง ให้ map `ConnectionStrings:Catalog` ไปเป็น `ConnectionStrings:Platform` แต่ใช้ฐานข้อมูล catalog แยกของ web05 ชื่อ `massage_platform` (อย่าใช้ `restaurantos_catalog` ร่วมกัน); map `Tenancy:AdminConnection` ไปเป็น `TenantDatabase:AdminConnectionString`; สร้าง signing key ใหม่สำหรับ `Jwt:SigningKey` อย่านำค่า `Jwt:Key` ที่ระบุว่า dev-only มาใช้ซ้ำ; และเพิ่ม `Platform:AdminUsername` กับ `Platform:AdminPasswordHash` ซึ่งไม่มีใน config เดิม

```powershell
cd C:\web05
notepad WebApi\MassagePlatform.WebApi\appsettings.Development.json
```

ใส่ค่าให้ครบ `ConnectionStrings:Platform`, `TenantDatabase:AdminConnectionString`, `Jwt:SigningKey` (สุ่มใหม่อย่างน้อย 32 bytes), `Platform:AdminUsername` และ `Platform:AdminPasswordHash` ส่วน JWT issuer/audience ตั้งค่าไว้ในไฟล์แล้ว สร้าง hash ของรหัสผ่านผู้ดูแลด้วย `dotnet run --project WebApi\GeneratePlatformPasswordHash` และกรอก hash ใน local config เท่านั้น

platform catalog database ต้องมีอยู่ก่อนเริ่ม API; ถ้ายังไม่มีให้สร้างด้วย `createdb -h localhost -U postgres massage_platform` (คำสั่งอาจถามรหัสผ่าน PostgreSQL) และให้ connection string ใน config ชี้ไปยัง catalog นี้

```powershell
dotnet run --project WebApi\MassagePlatform.WebApi --urls "http://localhost:5080"
```

Production ต้องใช้ secret manager ของ environment นั้น ห้าม deploy `appsettings.Development.json`

## เริ่มแอป

API ทำงานที่ `http://localhost:5080`; health check อยู่ที่ `/api/health` และ OpenAPI JSON อยู่ที่ `/openapi/v1.json` ใน Development

หน้าร้าน:

```powershell
cd C:\web05\WebClient
npm install
npm start
```

ผู้ดูแลแพลตฟอร์ม:

```powershell
cd C:\web05\AdminClient
npm install
npm start
```

แอป Angular proxy คำขอ `/api` ไปยัง API ที่พอร์ต 5080 ระหว่างพัฒนา พนักงานเข้าสู่ระบบด้วยรหัสร้าน (tenant slug), อีเมลเจ้าของร้าน และรหัสผ่านที่กำหนดตอน provision ร้าน

## ทดสอบ

รันจาก repository root:

```powershell
dotnet test MassagePlatform.slnx
cd WebClient; npm test -- --watch=false
cd ..\AdminClient; npm test -- --watch=false
```

## ขอบเขตและข้อจำกัด MVP

- หน้าร้านเชื่อม API สำหรับสาขา บริการ หมอนวด ลูกค้า ห้อง และนัดหมายที่พนักงานบันทึก
- หน้า POS บันทึกยอดขาย รายการบริการ ราคา ณ เวลาขาย สาขา ลูกค้า (ถ้ามี) และวิธีชำระเงินลงฐานข้อมูล tenant; การขายไม่สร้างนัดหมาย
- วิธีชำระเงินใน POS เป็นเพียงการบันทึกประเภทที่พนักงานเลือก (เงินสด/โอน/บัตร) ยังไม่มีการตัดเงินจริงหรือเชื่อมต่อ payment gateway
- ใน Development เจ้าของร้านหรือผู้จัดการเพิ่มชุดข้อมูลตัวอย่างได้ครั้งเดียวจากหน้าแดชบอร์ด; ข้อมูลประกอบด้วยบริการ ทีม ห้อง ลูกค้า นัดหมาย ตารางทำงาน และรายการขาย
- เมนูภายในร้านใช้ URL โดยตรงได้ เช่น `/pos`, `/booking`, `/rooms`, `/appointments`, `/services`, `/team`, `/customers`, `/branches` และ `/users`
- การจัดการสาขา บริการ หมอนวด ห้อง ลูกค้า และบัญชีพนักงานบันทึกผ่าน API; สิทธิ์เพิ่ม/แก้ไข/ปิดใช้งานบัญชีจำกัดตาม role ของ API
- หน้า Booking แสดงปฏิทินจากนัดหมายจริง ส่วน Room Board คำนวณสถานะว่าง/กำลังให้บริการ/จองแล้วจากนัดหมายที่บันทึกไว้และข้อมูลห้องที่เปิดใช้งาน
- หน้าลูกค้าแสดงข้อมูลติดต่อและจำนวนคิวตามวันที่เลือก; ระบบยังไม่มีระดับสมาชิก ยอดใช้จ่าย ประเภทห้อง หรือสถานะทำความสะอาดให้จัดการ
- ตารางหมอนวดรองรับเวลาทำงานประจำรายสัปดาห์หลายช่วงต่อวัน วันหยุด และเวลาเฉพาะวัน
- API ตรวจว่าระยะเวลานัดทั้งหมดอยู่ในเวลาทำงานของหมอนวดตามเขตเวลาสาขา
- ผู้ดูแลแพลตฟอร์มสร้างร้านและบัญชีเจ้าของร้าน พร้อม provision ฐานข้อมูลแยกต่อร้าน
- API ตรวจป้องกันการจองซ้อนเวลาสำหรับห้องและหมอนวด
- ยังไม่มีการจองโดยลูกค้า, payment gateway, notifications, recurring work schedules หรือการจัดการแพ็กเกจ

ก่อนใช้งานจริงต้องตั้งค่า secret อย่างปลอดภัย และทดสอบ PostgreSQL, tenant isolation, backup/restore และการ provision ใน environment เป้าหมาย
