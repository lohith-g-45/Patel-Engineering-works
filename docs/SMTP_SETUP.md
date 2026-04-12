# SMTP / Email Setup Guide — PEW Static Website

Since PEW is now a **pure static website** (no server), emails from the Contact form are handled via a third-party email service.

---

## Recommended: EmailJS (No Backend Required)

[EmailJS](https://www.emailjs.com) lets you send emails directly from JavaScript — no server needed.

### Step 1: Create an EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com) and sign up (free tier: 200 emails/month)
2. Click **Add New Service** → choose **Gmail** (or Yahoo/Outlook)
3. Connect your email account (e.g., `shipservice@yahoo.com`)
4. Note your **Service ID** (e.g., `service_pewvizag`)

### Step 2: Create an Email Template

1. Go to **Email Templates** → **Create New Template**
2. Use this template:

```
Subject: New Contact Form Submission — {{from_name}}

From: {{from_name}} ({{from_email}})
Phone: {{phone}}
Subject: {{subject}}

Message:
{{message}}
```

3. Note your **Template ID** (e.g., `template_contact`)

### Step 3: Get Your Public Key

1. Go to **Account** → **API Keys**
2. Copy your **Public Key** (e.g., `user_XXXXXXXXXXXXXXX`)

### Step 4: Add EmailJS to Contact Page

In `public/html/contact.html`, add before `</body>`:

```html
<!-- EmailJS SDK -->
<script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>
<script>
  emailjs.init("YOUR_PUBLIC_KEY");  // ← paste your public key here
</script>
```

### Step 5: Wire Up the Contact Form

Replace the form submit handler in `public/js/main.js`:

```javascript
document.getElementById('contact-form').addEventListener('submit', function(e) {
  e.preventDefault();

  const btn = document.getElementById('submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  emailjs.sendForm('service_pewvizag', 'template_contact', this)
    .then(() => {
      btn.textContent = 'Message Sent ✓';
      this.reset();
    }, (error) => {
      btn.textContent = 'Failed — Try Again';
      console.error('EmailJS error:', error);
    });
});
```

---

## Alternative: Formspree

If you prefer a simpler no-code option:

1. Go to [https://formspree.io](https://formspree.io) and sign up
2. Create a new form → get your endpoint URL
3. Update the `<form>` tag in `public/html/contact.html`:

```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
  <!-- existing form fields stay the same -->
</form>
```

No JavaScript changes needed — Formspree handles everything.

---

## Current Contact Details

| Field | Value |
|---|---|
| **Email** | shipservice@yahoo.com |
| **Tel** | 0891 – 2705 624 / 2567 346 |
| **Fax** | 0891 – 2705 624 |
| **Mobile** | 93931 02438 / 93931 04894 / 9820970059 |

---

## Testing

Send a test message through the contact form and verify:
- Email arrives at `shipservice@yahoo.com`
- Auto-reply is sent to the user (configure in EmailJS template settings)
- Form resets after successful submission
