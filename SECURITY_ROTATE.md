# Security: Rotate leaked secrets (quick guide)

If any secret has been exposed (chat, commits, issues), perform these steps immediately.

1) Rotate Google OAuth client secret
   - Go to Google Cloud Console → APIs & Services → Credentials
   - Select your OAuth Client ID → Create new client secret (or rotate) → Copy new value
   - Delete the old secret (or revoke it)

2) Rotate MongoDB user password
   - Go to MongoDB Atlas → Database Access → Edit user `ajproduction` → Set new password
   - Update `MONGODB_URI` in Vercel (see below)

3) Generate new NEXTAUTH_SECRET
   - Locally (PowerShell):
     ```powershell
     $bytes = New-Object byte[] 32
     [System.Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
     [Convert]::ToBase64String($bytes)
     ```

4) Update Vercel environment variables
   - Use the helper script: `.	ools\add-vercel-env.ps1` or run `vercel env add` interactively
   - Example (PowerShell, interactive):
     ```powershell
     vercel env add GOOGLE_CLIENT_SECRET production
     # paste secret when prompted
     ```

5) Remove secrets from repo files and consider cleaning history
   - Remove plaintext secrets from files and commit the removal.
   - To remove from Git history, use the BFG Repo-Cleaner or git-filter-repo:
     - BFG (recommended): https://rtyley.github.io/bfg-repo-cleaner/
     - git-filter-repo (fast, requires install): https://github.com/newren/git-filter-repo
   - NOTE: rewriting history requires force-push and coordination with collaborators.

6) Redeploy and test
   - Trigger redeploy via Dashboard or push an empty commit:
     ```powershell
     git commit --allow-empty -m "chore: redeploy after secret rotation"
     git push
     ```

If you want, I can prepare an automated `git-filter-repo` command snippet for the secrets found — tell me which secret tokens to remove (I will not store them). 
