# เว็บไซต์ MVM GROUP

เว็บไซต์หลักของ MVM GROUP แบบ Corporate Group Website รองรับ 3 ภาษา (ລາວ / English / 中文) พร้อมระบบหลังบ้าน (CMS) สำหรับแก้ไขข้อมูลเอง

- **ภาษาอังกฤษ** `/en/` · **ภาษาลาว** `/la/` · **ภาษาจีน** `/zh/`
- **ระบบหลังบ้าน (CMS):** `/admin/`
- หน้าแรก `/` จะพาผู้เข้าชมไปยังภาษาตามการตั้งค่าเบราว์เซอร์โดยอัตโนมัติ

## หน้าที่มีในเว็บไซต์ (ทุกภาษา)

| หน้า | URL |
|---|---|
| Home — โลโก้ + แนะนำบริษัท, ภาพลายเส้นพระธาตุหลวง และธุรกิจทั้งหมดในเครือ แสดงเป็น "หน้าสิมวัดลาว" (หน้าบันรัศมี, ลายไฟ, ลายตีนซิ่น) | `/en/` |
| About | `/en/about/` |
| Services + หน้ารายละเอียด 6 บริการ | `/en/services/`, `/en/services/business-consulting/` … |
| ทัวร์ (หน้าท่องเที่ยว) + แพ็กเกจทัวร์ 4 แบบ พร้อมโปรแกรมรายวัน | `/la/services/tour-travel/`, `/la/services/tour-travel/classic-laos/` … |
| Business units (หน่วยธุรกิจ) | `/en/group/business-services/` … |
| Brands + หน้าแบรนด์ | `/en/brands/`, `/en/brands/big-elephant-yogurt/`, `/en/brands/pa-daek-sophanua/` |
| ผลงาน (Our work / Projects) | `/en/projects/` |
| News / Blog + หมวดหมู่ | `/en/news/`, `/en/news/category/logistics/` |
| Contact (ฟอร์มติดต่อ) | `/en/contact/` |
| Request a Quote (ฟอร์มขอใบเสนอราคา) | `/en/quote/` |
| Distributor / Partnership (ฟอร์มสมัครตัวแทน/พาร์ทเนอร์) | `/en/partnership/` |
| Privacy Policy, Terms | `/en/privacy/`, `/en/terms/` |

---

## ✅ สิ่งที่ต้องเตรียมก่อนเปิดใช้จริง

ข้อมูลเหล่านี้ใส่เป็น Placeholder ไว้ตามบรีฟ แก้ไขได้ทั้งหมดใน CMS:

1. **โลโก้** — ใส่โลโก้จริงของบริษัทแล้ว (แปลงจากรูปต้นฉบับเป็นไฟล์เวกเตอร์แบบละเอียด เส้นและลายดอกไม้ตรงกับต้นฉบับ พร้อมตัวอักษร MVM GROUP ใต้โลโก้) ไฟล์อยู่ใน `public/brand/`:
   - `logo-lockup.svg` / `logo-lockup.png` — โลโก้หลัก (สัญลักษณ์ + MVM GROUP ด้านล่าง) สำหรับพื้นเข้ม
   - `logo-lockup-on-light.svg` — สีทองเข้ม สำหรับพื้นขาว/เอกสาร
   - `logo-emblem.svg`, `logo-emblem-bold.svg` (ขนาดเล็ก), `mvm-wordmark.svg` (ตัวอักษร)
   - ถ้ามีไฟล์โลโก้ต้นฉบับแบบเวกเตอร์ (AI/SVG/PDF) จากนักออกแบบ แนะนำให้นำมาแทนเพื่อความคมชัดสูงสุด
2. **ข้อมูลติดต่อ** — เบอร์โทร, WhatsApp, WeChat ID + QR Code, Email, ที่อยู่, เวลาทำการ, Google Map, Facebook, TikTok (*Site settings → Contact channels*) ค่าที่มี `XXXX` จะถูกถือว่ายังไม่ได้กรอก และจะไม่สร้างลิงก์
3. **ข้อมูลจดทะเบียนบริษัท** — ชื่อจดทะเบียน, เลขทะเบียนวิสาหกิจ, เลขผู้เสียภาษี, ไฟล์ใบอนุญาต (*Site settings → Company registration*)
4. **ทีมผู้บริหาร** — ชื่อ ตำแหน่ง รูป (*Leadership team*) แล้วเอาเครื่องหมาย "Placeholder profile" ออก
5. **เรื่องราวการก่อตั้งบริษัท** — ปีก่อตั้ง ผู้ก่อตั้ง และเรื่องราวจริง และเหตุการณ์สำคัญ (*About page → Our story / Milestones*) ตอนนี้ปีก่อตั้งยังเป็น `20XX`
6. **ข้อมูลแบรนด์** — รูปสินค้า, ชื่อรสชาติ, ขนาด, รายการสินค้า, จุดจำหน่าย, ช่องทางติดต่อแบรนด์ (*Brands*)
7. **Projects** — ตอนนี้มี 6 โปรเจกต์ตัวอย่าง (ติดป้าย "Sample entry" และไม่ถูกเก็บโดย Google) ให้แทนที่ด้วยผลงานจริงหรือลบทิ้ง
8. **ตรวจทานเนื้อหา**
   - ข้อความภาษาลาวและภาษาจีนควรให้เจ้าของภาษาตรวจทานก่อนเปิดใช้
   - ขั้นตอนบริการ, เอกสารที่ต้องใช้ และระยะเวลาดำเนินการ เป็นร่างทั่วไป ควรให้ทีมงานยืนยันกับการทำงานจริง
   - Privacy Policy และ Terms ควรให้ที่ปรึกษากฎหมายตรวจ
   - ชื่อภาษาลาวของ Big Elephant Yogurt ในบรีฟเขียนว่า `ຍໂຢເກີດທ໌ ຊ້າງໃຫຍ່` (มี ຍ นำหน้า) เว็บไซต์ใช้ `ໂຢເກີດທ໌ ຊ້າງໃຫຍ່` — ถ้าชื่อที่ถูกต้องต่างจากนี้ แก้ได้ที่ *Brands → Big Elephant Yogurt → Brand name in Lao*
9. **ราคา** — ไม่แสดงราคา ทุกบริการแสดง "Contact us for quotation" ตามบรีฟ

---

## ดูเว็บไซต์ในเครื่องของคุณ

ต้องมี [Node.js](https://nodejs.org/) เวอร์ชัน 18 ขึ้นไป (ไม่ต้อง `npm install` เพราะโปรเจกต์นี้ไม่มี dependency)

```bash
cd MVMGROUP.LA
npm run dev
```

เปิด <http://localhost:4321/en/> — เมื่อแก้ไฟล์ เว็บจะ build ใหม่และรีเฟรชเองอัตโนมัติ

คำสั่งอื่น:

```bash
npm run build   # สร้างเว็บไซต์ลงโฟลเดอร์ dist/
npm run check   # ตรวจลิงก์เสียทั้งเว็บ (รันหลัง build)
npm run fonts   # (ทางเลือก) ดาวน์โหลดฟอนต์มาเก็บในเว็บเอง — ดูหัวข้อ "ผู้เข้าชมจากประเทศจีน"
```

---

## นำเว็บขึ้นออนไลน์ด้วย Netlify (แนะนำ)

Netlify ให้ Hosting, **SSL/HTTPS ฟรี**, ระบบรับฟอร์มส่งเข้าอีเมล, กันสแปม และระบบล็อกอินของ CMS ในที่เดียว การตั้งค่า build อยู่ในไฟล์ `netlify.toml` แล้ว

1. **อัปโหลดโค้ดขึ้น GitHub** — สร้าง repository ใหม่ (Private ได้) แล้ว push โฟลเดอร์นี้ขึ้นไป (branch `main`)
2. **เชื่อม Netlify** — เข้า [app.netlify.com](https://app.netlify.com) → *Add new site → Import an existing project* → เลือก repository → กด Deploy (Netlify อ่านค่าจาก `netlify.toml` เอง: build command `node scripts/build.mjs`, publish `dist`)
3. **ตั้งโดเมน** — *Domain management → Add a domain* → ใส่ `mvmgroup.la` (หรือ `www.mvmgroup.la`) แล้วตั้ง DNS ตามที่ Netlify แนะนำ SSL จะเปิดให้อัตโนมัติ
4. **เปิดระบบล็อกอิน CMS**
   - *Project configuration (หรือ Site configuration) → Identity* → **Enable Identity**
   - ตั้ง *Registration preferences* เป็น **Invite only**
   - ในหน้า Identity → *Services* → **Enable Git Gateway**
   - *Identity → Invite users* → ใส่อีเมลของคนที่จะแก้ไขเว็บ ผู้รับจะได้อีเมลเชิญ คลิกลิงก์แล้วตั้งรหัสผ่าน จากนั้นเข้า `https://<โดเมน>/admin/`
5. **ให้ฟอร์มส่งเข้าอีเมลบริษัท**
   - *Project configuration → Forms* → เปิด **Form detection** แล้ว Deploy อีกครั้ง
   - Netlify จะพบ 3 ฟอร์ม: `contact`, `quote`, `partnership`
   - *Forms → Form notifications → Add notification → Email notification* → ใส่อีเมลบริษัท (ทำทีละฟอร์ม หรือเลือก "Any form")
   - ข้อความทั้งหมดดูย้อนหลังได้ในหน้า *Forms* ของ Netlify ด้วย
6. **ตั้งค่า Analytics** — ใส่ Google Analytics 4 ID (`G-…`) และ Meta Pixel ID ใน CMS ที่ *Site settings → Analytics* ระบบจะใส่โค้ดให้ทุกหน้าและส่ง event `generate_lead` / `Lead` เมื่อมีคนส่งฟอร์มสำเร็จ
7. **ส่ง Sitemap ให้ Google** — ใน Google Search Console เพิ่มเว็บไซต์ (ใส่ verification code ได้ใน *Site settings → Analytics*) แล้วส่ง `https://<โดเมน>/sitemap.xml`

> ถ้าไม่ใช้ Netlify: เว็บเป็น static site ทั้งหมด (โฟลเดอร์ `dist/`) ใช้กับ Hosting ใดก็ได้ แต่ต้องหาบริการฟอร์มและระบบล็อกอิน CMS เอง

---

## การใช้ระบบหลังบ้าน (CMS)

เข้า `https://<โดเมน>/admin/` แล้วล็อกอิน เมนูด้านซ้าย:

| เมนู | ใช้ทำอะไร |
|---|---|
| **Services** | เพิ่ม/แก้บริการ — บริการใหม่จะมีหน้าของตัวเอง และขึ้นในเมนูและ Footer อัตโนมัติ |
| **Tour packages** | แพ็กเกจทัวร์: ชื่อ, ระยะเวลา, เส้นทาง, รูป, จุดเด่น, โปรแกรมรายวัน (เที่ยวที่ไหน / นอนที่ไหน / เดินทางอย่างไร), สิ่งที่รวม/ไม่รวมในราคา — เพิ่มแพ็กเกจใหม่ได้เอง จะขึ้นในหน้าท่องเที่ยวอัตโนมัติ ส่วนจุดหมายปลายทางและข้อมูลการท่องเที่ยวแก้ที่ *Services → Tour & Travel → Tours page* |
| **Business units** | หน่วยธุรกิจในเครือ มีตัวอย่างที่เตรียมไว้แล้ว: Transportation, Media, Technology, Real Estate, Investment (สถานะ *planned* = ซ่อนอยู่) เปลี่ยน Status เป็น **active** เมื่อพร้อมเปิด จะขึ้นในหน้า About, เมนู About และมีหน้าของตัวเอง |
| **Brands** | เพิ่ม/แก้แบรนด์ — แบรนด์ใหม่จะขึ้นในหน้าแรก เมนู ฟอร์มสมัครตัวแทน และมีหน้าของตัวเอง ส่วนที่ไม่มีข้อมูลจะถูกซ่อน |
| **Our work (projects)** | ผลงาน: รูป คำอธิบาย ลูกค้า ประเภทงาน ปี แกลเลอรี (รูปหรือวิดีโอ) |
| **News & articles** | บทความ/ข่าว พร้อมหมวดหมู่และช่อง SEO |
| **Leadership team** | ทีมผู้บริหาร |
| **Settings & pages** | ข้อมูลติดต่อ, โลโก้, Analytics, เนื้อหาหน้า Home / About, หัวข้อหน้าต่างๆ, Privacy/Terms, เมนูเพิ่มเติม |

**การแปลภาษา:** ในหน้าแก้ไขจะมีปุ่มสลับภาษา `en / la / zh` ช่องที่แปลได้จะมีในทุกภาษา ส่วนรูปภาพ ลำดับ และข้อมูลติดต่อใช้ร่วมกันทุกภาษา ถ้าช่องภาษาลาวหรือจีนว่างไว้ เว็บจะแสดงข้อความภาษาอังกฤษแทน (ไม่มีช่องว่างเปล่าบนเว็บ)

**รูปภาพ:** อัปโหลดผ่าน CMS ได้เลย (เก็บที่ `public/uploads/`) แนะนำย่อรูปก่อนอัปโหลด: กว้างไม่เกิน 2000px, ไฟล์ JPG/WebP ไม่เกิน ~300KB เพื่อให้เว็บโหลดเร็ว
**วิดีโอ:** ใส่ลิงก์ YouTube หรืออัปโหลดไฟล์ MP4 ในแกลเลอรี วิดีโอ YouTube จะโหลดเมื่อกดเล่นเท่านั้น หน้าเว็บจึงยังเร็ว
**หน้าแรก:** *Home page → Businesses in the group* แก้ชื่อ ข้อความ ลิงก์ สีประตู ไอคอน หรือใส่โลโก้ของแต่ละธุรกิจ เพิ่ม/ลบ/สลับลำดับได้ ถ้าธุรกิจไหนมีเว็บไซต์ของตัวเองแล้ว ให้ใส่ที่อยู่เว็บเต็ม (https://...) ในช่อง Link
**ภาพท่องเที่ยว:** ตอนนี้ใช้ภาพวิวลาว 6 ภาพ (น้ำตกตาดกวางสี, วังเวียง, แม่น้ำโขง, พูสี, วัดใหม่ หลวงพระบาง, ธาตุหลวง) สลับกันแบบสไลด์ ภาพทั้งหมดอยู่ที่ `public/img/photos/` เป็นภาพของ Basile Morin (CC BY-SA 4.0) และ Benh Lieu Song (ธาตุหลวง, CC BY-SA 3.0) จาก Wikimedia Commons ใช้เชิงพาณิชย์ได้แต่ต้องแสดงเครดิต (มีบรรทัดเครดิตเล็กๆ ในหน้าแล้ว) ใช้ในหน้าทัวร์ ถ้าเปลี่ยนเป็นภาพทัวร์จริงของบริษัท ให้แก้ที่ *Services → Tour & Travel → Tours page: slideshow photos* และภาพของแต่ละ *Tour package* แล้วลบข้อความเครดิตภาพ

หลังกด **Publish** Netlify จะ build เว็บใหม่ภายในประมาณ 1 นาที

---

## ฟังก์ชันที่รองรับ

- Responsive: Desktop / Tablet / Mobile
- โหลดเร็ว: Static HTML, CSS+JS รวมประมาณ 60KB, ไม่มี framework หนักๆ, รูปโหลดแบบ lazy
- SEO: title/description ทุกหน้า, `hreflang` 3 ภาษา, canonical, Open Graph, `sitemap.xml`, `robots.txt`, structured data (Organization, Service, FAQ, Article, Brand, Breadcrumb)
- Google Analytics 4 + Meta Pixel (ตั้งค่าใน CMS)
- ฟอร์ม Contact / Request a Quote / Partnership พร้อมตรวจข้อมูลก่อนส่ง (ข้อความแจ้งเตือนตามภาษาของหน้า) และส่งเข้าอีเมลผ่าน Netlify Forms
- ป้องกันสแปม: Honeypot + ตัวกรองสแปม (Akismet) ของ Netlify, เปิด reCAPTCHA เพิ่มได้ใน CMS
- SSL: ฟรีอัตโนมัติจาก Netlify
- ปุ่มติดต่อด่วน (WhatsApp / WeChat / โทร / อีเมล) มุมขวาล่าง แสดงเมื่อกรอกข้อมูลติดต่อจริงแล้ว
- Animation แบบเรียบ: เฟด/สไลด์ตอนเลื่อน, Parallax เล็กน้อยที่ลวดลายพื้นหลัง และปิดให้อัตโนมัติสำหรับผู้ใช้ที่ตั้งค่าลดการเคลื่อนไหว

## ผู้เข้าชมจากประเทศจีน

Google (Fonts, Maps, reCAPTCHA, Analytics) ถูกบล็อกในจีนแผ่นดินใหญ่ เว็บนี้ออกแบบให้ยังใช้งานได้ปกติ:
- ฟอนต์โหลดแบบไม่บล็อกหน้าเว็บ ถ้าโหลดไม่ได้จะใช้ฟอนต์ของเครื่องแทน หากต้องการให้ฟอนต์เหมือนกันทุกที่ รัน `npm run fonts` หนึ่งครั้ง (ต้องต่ออินเทอร์เน็ต) แล้ว commit โฟลเดอร์ `public/fonts/` ขึ้นไป
- reCAPTCHA ปิดไว้เป็นค่าเริ่มต้น เพื่อให้ผู้ใช้จากจีนส่งฟอร์มได้
- หน้า Contact แสดง WeChat ID และ QR Code แยกจากแผนที่ Google

---

## โครงสร้างไฟล์

```
content/            ← เนื้อหาทั้งหมด (CMS เขียนไฟล์ที่นี่) แต่ละไฟล์มีครบ 3 ภาษา en / la / zh
  services/  units/  brands/  projects/  news/  team/
  settings/  site.yml  home.yml  about.yml  pages.yml  legal.yml
public/             ← ไฟล์ที่คัดลอกขึ้นเว็บตรงๆ
  admin/            ← CMS (index.html, config.yml)
  brand/            ← โลโก้, favicon, รูปแชร์โซเชียล
  img/patterns/     ← ลวดลายลาว (แถบลาย, ลายตาข่ายดอกจำปา, มุมกรอบ)
  img/illustrations/← ภาพลายเส้นทองชั่วคราว (ใช้จนกว่าจะมีรูปจริง)
  uploads/          ← รูปที่อัปโหลดผ่าน CMS
src/
  pages/            ← เทมเพลตแต่ละหน้า
  components/       ← Header, Footer, ฟอร์ม, การ์ด, ไอคอน
  lib/i18n.mjs      ← ข้อความในหน้าเว็บ (ปุ่ม, ป้ายฟอร์ม ฯลฯ) ทั้ง 3 ภาษา
  lib/taxonomies.mjs← หมวดหมู่ Projects / News และตัวเลือกในฟอร์มขอใบเสนอราคา
  assets/           ← main.css (ดีไซน์ทั้งหมด), main.js
scripts/            ← build, dev server, ตรวจลิงก์, ดาวน์โหลดฟอนต์
netlify.toml        ← ตั้งค่า Netlify (build, redirect ภาษา, security headers, cache)
```

## สำหรับนักพัฒนา

- ไม่มี dependency ภายนอก: build ด้วย Node.js ล้วน (`scripts/build.mjs`) ใช้ `marked` และ `js-yaml` ที่ฝังไว้ใน `src/vendor/` (MIT license)
- เนื้อหาใช้โครงสร้าง i18n แบบ `single_file` ของ Decap CMS: ข้อมูลที่ไม่แปลอยู่ใต้ `en` เท่านั้น ส่วน `la` / `zh` มีเฉพาะช่องที่แปล ตัว build รวมให้อัตโนมัติ และใช้ภาษาอังกฤษแทนเมื่อคำแปลว่าง
- **เพิ่มหมวดหมู่ Projects/News หรือตัวเลือกฟอร์ม:** แก้ `src/lib/taxonomies.mjs` และรายการ `options` ใน `public/admin/config.yml` ให้ตรงกัน
- **แก้ข้อความปุ่ม/ป้ายต่างๆ:** `src/lib/i18n.mjs`
- **สี ฟอนต์ ระยะห่าง:** ตัวแปร CSS ด้านบนของ `src/assets/main.css`
  - ดำ/ทอง/ขาวนวล: `--lacquer`, `--gold`, `--paper` · สีเสริม: `--navy`, `--forest`
  - ฟอนต์: Marcellus (หัวข้ออังกฤษ), Noto Serif Lao / Noto Sans Lao (ลาว), Noto Sans (เนื้อหา), ฟอนต์ระบบสำหรับจีน
- แก้ CMS แบบออฟไลน์ในเครื่อง: เปิด `local_backend: true` ใน `public/admin/config.yml` แล้วรัน `npx decap-server` คู่กับ `npm run dev`
- ระบบล็อกอินสำรอง: ถ้าไม่ใช้ Netlify Identity เปลี่ยน `backend` ใน `config.yml` เป็น `github` (ผู้แก้ไขต้องมีบัญชี GitHub)
