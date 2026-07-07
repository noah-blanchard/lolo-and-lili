# Email OTP templates

Branded HTML for the **6-digit email OTP** login flow (Peachy Pastel theme). These are
pasted into the Supabase dashboard — Supabase renders them (Go templating) and sends them
through Resend (SMTP relay). They are **not** imported by the app; they live here so the
design is version-controlled.

| File | Paste into Supabase → Auth → Email Templates | When it fires |
| --- | --- | --- |
| `otp-magic-link.html` | **Magic Link** | Returning users (email already exists) |
| `otp-confirm-signup.html` | **Confirm signup** | Brand-new users (`signInWithOtp` runs with `shouldCreateUser: true`) |

Both must be updated — a first-time email hits *Confirm signup*, every later one hits
*Magic Link*.

## The one thing that matters

Each template shows the code via the Go variable **`{{ .Token }}`**. Do **not** use
`{{ .ConfirmationURL }}` / `{{ .TokenHash }}` — those are for the (now-removed) magic-link
flow. Because we send a code instead of a link, there is no clickable button.

## Setup checklist

1. **Resend**: verify your sending domain (add its DNS records), create an API key.
2. **Supabase → Auth → SMTP Settings**: host `smtp.resend.com`, port `465`, username
   `resend`, password = Resend API key, sender = an address on the verified domain, sender
   name `Lolo & Lili`.
3. **Supabase → Auth → Email Templates**: paste each file into its template above.
4. **Supabase → Auth → Providers → Email**: keep the OTP expiry at **600s (10 min)** so it
   matches the "valid for 10 minutes" copy in these emails.

## Notes

- Table-based layout + inline styles for email-client compatibility. The Google Fonts
  `<link>` (Fredoka / Quicksand) is progressive enhancement; clients that strip it fall
  back to system sans-serif.
- The returning-user email uses the coral code pill; the signup email uses the mint pill to
  feel a touch more celebratory. Both match the app's palette
  (coral `#ff8fa3`, mint `#9ee6cf`, cream `#fff7f0`).
