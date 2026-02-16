# Party Applicant API - Authentication & Setup Guide

## 🔍 **Authentication Issue (401 Error)**

If you're getting a **401 Unauthorized** error, it means:

1. **You are not logged in** - Need valid JWT token in cookies
2. **Token has expired** - Session expired, need to login again
3. **CORS credentials not sent** - Browser not sending cookies

---

## ✅ **How to Fix 401 Errors**

### **Step 1: Login First**
Make sure you're logged in as an **admin user** before accessing the party-applicants page.

```
POST /api/auth/login
{
  "cnic_no": "1234567890123",
  "password": "your_password"
}
```

✅ Login sets HTTP-only cookie with JWT token

### **Step 2: Verify Cookie is Sent**
Browser developer tools → Network tab → Check request headers include:
```
Cookie: token=eyJhbGc...
```

### **Step 3: Check Admin Role**
Your user must have role: **"admin"** to access `GET /api/partyApplicant`

---

## 📋 **API Endpoints Used**

### **1. Get All Party Applicants** (Admin Only)
```
GET /api/partyApplicant
Auth: Required (admin)
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": { "_id": "...", "name": "John", "email": "john@example.com" },
    "party_name": "Democratic Party",
    "party_admin_name": "John Doe",
    "status": "pending",
    "payment": { "method": "bank", "amount": 50000, "proof_image": "..." },
    "party_members": [...],
    "party_office_bearers": [...],
    "party_constitution_document": "..."
  }
]
```

---

### **2. Update Party Application Status** (Admin Only)
```
PUT /api/partyApplicant/:id/status
Auth: Required (admin)

Body:
{
  "status": "approved",  // or "rejected"
  "rejection_reason": "Not qualified"  // only if rejected
}
```

---

### **3. Update User Role**
```
PUT /auth/profile/:userId
Auth: Required

Body:
{
  "role": "party"  // Change user role from "citizen" to "party"
}
```

---

### **4. Create Party Record** (After Approval)
```
POST /api/party
Auth: Required

Body:
{
  "userId": "507f1f77bcf86cd799439012",
  "party_name": "Democratic Party",
  "party_admin_name": "John Doe",
  "party_Symbol": "507f1f77bcf86cd799439016"  // Symbol ID
}
```

---

### **5. Get Symbols**
```
GET /api/symbol
Auth: Not required

Response:
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439016",
      "name": "Lion",
      "image": "uploads/symbols/lion.png"
    }
  ]
}
```

---

## 🔐 **Middleware Chain**

```
Request → CORS Check → Cookie Parser → Auth Middleware (protect)
                                              ↓
                                        Check token in cookies
                                              ↓
                                        Verify JWT signature
                                              ↓
                                        Get User from DB
                                              ↓
                                   Admin Role Check (adminOnly)
                                              ↓
                                         Execute Controller
```

---

## 🛠️ **Server Setup Checklist**

- [ ] Node.js running: `npm run dev` in `/server`
- [ ] MongoDB connected
- [ ] `.env` file has:
  - `JWT_SECRET` (random string)
  - `PORT=5000` (or your port)
  - `NODE_ENV=development`
- [ ] CORS origin includes client URL: `http://localhost:3000`
- [ ] Cookie parser middleware enabled

---

## 🖥️ **Client Setup Checklist**

- [ ] Next.js running: `npm run dev` in `/client`
- [ ] `.env.local` has:
  - `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api`
- [ ] Login page working (get JWT cookie)
- [ ] User role is "admin"

---

## 🔍 **Debug Commands**

### **Check if server is running:**
```bash
curl http://localhost:5000/api/symbol
```

### **Test login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cnic_no":"1234567890123","password":"password"}' \
  -c cookies.txt
```

### **Test protected endpoint (with cookie):**
```bash
curl http://localhost:5000/api/partyApplicant \
  -b cookies.txt
```

---

## 📚 **Workflow: From Application to Approval**

```
1. User submits PartyApplicant (with members, bearers, payment proof, constitution)
                    ↓
2. Application stored in PartyApplicant collection with status: "pending"
                    ↓
3. Admin views all pending applications on /admin/party-applicants page
                    ↓
4. Admin clicks "Approve" button on a party application
                    ↓
5. Admin sees modal to select a party symbol
                    ↓
6. Admin selects symbol and clicks "APPROVE & REGISTER"
                    ↓
7. System executes 3 steps:
   a) Update PartyApplicant status → "approved"
   b) Update User role → "party"
   c) Create Party record with symbol
                    ↓
8. Party is now registered and can participate in elections!
```

---

## 🚨 **Common Errors**

| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | No/invalid JWT token | Login first |
| 403 Forbidden | Not admin role | Use admin account |
| 404 Not Found | Invalid route | Check URL spelling |
| 500 Server Error | DB/Code error | Check server logs |
| CORS error | Wrong origin | Update CORS origin in server |

---

## 📞 **Support**

If you still get 401 errors:
1. Check browser console for exact error message
2. Check server logs in terminal
3. Verify `.env` config
4. Clear browser cookies and login again
