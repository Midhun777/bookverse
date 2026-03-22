# Bookverse - Last Minute Quick Revision (Manglish)

Viva-kku pookkunnathinu thottu munpu just onnu vaayichu nokkan ulla short notes.

---

### 1. ONE-LINER (Project enthanen chothichal)
_"Sir, Bookverse enna ee project oru web application aanu. MERN stack upayogichanu ithu undakkiyittullath. Ee app vazhi users-nu books search cheyyam, notes edukkam, vaayicha books track cheyyam, pinne reviews kodukkam. Oru digital library poleyanithu."_

---

### 2. TECH STACK (Athu enthanen chothichal)
- **React.js:** Frontend. Nammude website-nte body undakkan (Speed koodan).
- **Tailwind CSS:** Frontend. Website nannayi decorate cheyyan ulla CSS framework.
- **Node.js + Express.js:** Backend. Website-nte brain. Data process cheyyunathu ivideyanu.
- **MongoDB:** Database. Users-nte details, books ellam save cheyyunna godown.
- **Vite:** Frontend speed aayittu build cheyyan (Create-React-App-inu pakaram).

---

### 3. ARCHITECTURE (Flow engane aanen chothichal)
`Frontend (React)` ----(Axios API Call)----> `Backend (Express)` ----(Mongoose Query)----> `Database (MongoDB)`

1. User button click cheyyumbol React request ayakkum.
2. Express athu swikarichu, Mongoose database-il ninnu data thedum.
3. Database data Express-in kodukkum, Express athu veendum React-in ayakkum.

---

### 4. MAIN FEATURES (Iduthu parayenda karyangal)
- **JWT Authentication:** Login secure aakkan (JSON Web Token) use cheythu.
- **Reading Progress:** Oru book ellarum vaayikkunathinte page-wise track record vekkam.
- **Dynamic Homepage:** Nammude home page-ile "Trending Books" verum static alla. Kooduthal aalkkar nokkiya books automatic aayi Home page-il trending aayi varunna aggregating logic backend-il undu.

---

### 5. VIVA GOLDEN ANSWERS (Chothikkan chance ulla important questions)

**Q: Why React? (HTML/JS theera pore?)**
Ans: React oru SPA (Single Page Application) aanu. Athaayath page eppozhum reload avilla, components maathram maarikondirikkum. Athukond loading time valare kuravanu (Performance is high).

**Q: Why MongoDB instead of MySQL?**
Ans: MongoDB oru NoSQL database aanu. Athil data strict aaya tables aayi allathe, JSON-like document aayanu save cheyyunnath. Nammude javascript project-in (MERN) ee JSON data flow valare pettannu connect aavum.

**Q: What is JWT / How does Login work?**
Ans: JWT (JSON Web Token) aanu Authentication-u use cheyyunnath. User email-um password-um adichal, backend database nokki match aanenkil oru "Token" thirichu tharum. Ithoru ID Card poleyanu. Pinne enthu cheyyanum (Matoru page edukkanokke) user ee id card server-lekku kanikkenam.

**Q: Node.js-um Express-um thammil enthanu vyathyasam?**
Ans: Node.js oru engine (runtime) aanu javascript server-il run cheyyan. Express enna parayunnath Node.js-il ezhuthan pattiya oru framework aanu. Express use cheythal code ezhuthan valare easy aanu.

---
**Tip:** _Confident aayi irikkuka. Answer thettipoyalum concept ariyavunathra manglish-lum english-lum aayi detail aayi parayuka! All the best!_
