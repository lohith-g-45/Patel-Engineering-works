# Admin System Setup Guide

## ✅ Complete Implementation Summary

Your admin system is now fully implemented! Here's what has been added:

### 📋 What's Been Implemented

#### 1. **Authentication System**
- JWT-based authentication (stateless, scalable)
- Login page at `/admin`
- Secure password hashing with bcrypt
- Token storage in browser localStorage

#### 2. **Admin Features**
- **Admin Dashboard** (`/admin/dashboard`) - View statistics and action history
- **Add Articles** (`/admin/add`) - Create new blog posts
- **Edit Articles** (`/admin/edit/<id>`) - Modify existing posts
- **Delete Articles** - With confirmation modal
- **Action History** - Track all create/edit/delete actions

#### 3. **User Interface**
- Admin controls visible only when logged in
- Edit (✏️) and Delete (🗑️) icons on each article in media page
- Admin link in navbar (appears when logged in)
- Logout button
- Delete confirmation modal

#### 4. **API Endpoints** (RESTful)

**Authentication:**
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/logout` - Logout (client-side removes token)

**Articles:**
- `GET /api/articles` - Get all articles (public)
- `POST /api/articles` - Create article (admin only)
- `GET /api/articles/<id>` - Get single article
- `PUT /api/articles/<id>` - Update article (admin only)
- `DELETE /api/articles/<id>` - Delete article (admin only)

**Admin:**
- `GET /api/admin/history` - Get action history (admin only)

---

## 🚀 Getting Started

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Run the App
```bash
python app.py
```

The app will automatically:
- Create the SQLite database (`pew_vizag.db`)
- Create initial admin user with credentials:
  - **Username:** `admin`
  - **Password:** `admin123`

### Step 3: Access Admin Area
1. Go to `http://localhost:5000/admin`
2. Login with the credentials above
3. You'll be redirected to the dashboard

### Step 4: Change Default Password (IMPORTANT!)
The system will create an initial admin account with the default password `admin123`. **Change this immediately in production!**

To change the password:
1. Access the database directly or add an admin panel endpoint
2. Update the AdminUser password hash

---

## 📝 How to Use

### Adding an Article
1. Click "Add New Article" from dashboard or media page
2. Fill in:
   - **Title** - Article headline
   - **Category** - Blog, News, Press Release, or Case Study
   - **Content** - Article body (supports HTML)
   - **Image URL** (optional) - Full URL to featured image
3. Click "Save Article"

### Editing an Article
1. Go to media page
2. Hover over an article and click the ✏️ icon
3. Modify the fields
4. Click "Update Article"

### Deleting an Article
1. Hover over an article and click the 🗑️ icon
2. Confirm the deletion in the popup modal

### Viewing Action History
1. Go to Admin Dashboard
2. See "Recent Activity" table at the bottom
3. Shows all create/edit/delete actions with timestamps

---

## 🔐 Security Features

✅ **JWT Authentication** - Tokens expire after 24 hours
✅ **Password Hashing** - Bcrypt with salt
✅ **Token Protection** - Middleware validates all admin routes
✅ **Backend Validation** - All operations verified server-side
✅ **CORS Ready** - Can be extended for frontend separation

---

## 📂 Project Structure

```
templates/
├── media.html                    # Updated with admin controls
└── admin/
    ├── login.html               # Login page
    ├── dashboard.html           # Admin dashboard
    └── editor.html              # Add/edit article form

app.py                            # Updated with all routes
models.py                         # Database models (unchanged)
requirements.txt                  # Updated with PyJWT
```

---

## 🛠️ Configuration

Edit these in `app.py` for production:

```python
# Line 17-19: Change secret key
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "your-secret-key-here")
app.config["JWT_ALGORITHM"] = "HS256"
app.config["JWT_EXPIRATION_HOURS"] = 24
```

### Environment Variables (Recommended)
Create a `.env` file:
```
JWT_SECRET_KEY=your-long-random-secret-key
DATABASE_URL=sqlite:///pew_vizag.db
```

---

## 📊 Database Schema

### AdminUser
- `id` - Primary key
- `username` - Unique username
- `password_hash` - Bcrypt hash

### Article
- `id` - Primary key
- `title` - Article title
- `content` - Article body
- `image_url` - Featured image URL (optional)
- `category` - Blog/News/Press Release/Case Study
- `created_at` - Timestamp

### ContentHistory
- `id` - Primary key
- `action` - CREATE/UPDATE/DELETE
- `entity_type` - Article/Gallery/Video/etc
- `entity_id` - ID of modified entity
- `details` - Action description
- `admin_username` - Who performed action
- `created_at` - Timestamp

---

## 🔄 Future Enhancements

You can easily extend this system:

1. **Dynamic Gallery & Videos** - Add API endpoints for GalleryImage and Video models
2. **Admin Panel for Users** - Create another admin to manage other admins
3. **Bulk Operations** - Batch upload/delete articles
4. **Search & Filters** - Filter articles by category/date
5. **Draft System** - Add status field (draft/published)
6. **File Upload** - Store images instead of URLs
7. **Email Notifications** - Alert on article creation

---

## 🐛 Troubleshooting

### "Token expired" error
- Tokens expire after 24 hours
- Users need to login again
- Adjust `JWT_EXPIRATION_HOURS` if needed

### Admin controls not showing
- Check if localStorage has `admin_token`
- Open browser DevTools > Application > LocalStorage
- Verify token format: `Bearer <token>`

### 404 on admin routes
- Ensure app is running with `python app.py`
- Check that Flask is serving templates correctly

### Database errors
- Delete `pew_vizag.db` to reset
- Run app again to recreate tables
- Check file permissions

---

## 📞 Support

All code is well-commented. Key files to review:
- [app.py](app.py) - Routes and authentication logic
- [models.py](models.py) - Database schemas
- [templates/admin/](templates/admin/) - Frontend templates

---

## 🎯 Quick Checklist

- [ ] Install dependencies: `pip install -r requirements.txt`
- [ ] Run app: `python app.py`
- [ ] Test login at `/admin` (admin/admin123)
- [ ] Create an article
- [ ] Edit the article
- [ ] Delete the article
- [ ] Check dashboard history
- [ ] **Change admin password before deployment**
- [ ] Update `JWT_SECRET_KEY` in production
- [ ] Set up `.env` file with environment variables

---

**Implementation Date:** March 20, 2026  
**Status:** ✅ Production Ready (with password change)
