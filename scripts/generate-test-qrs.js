const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const qrList = [
  // ── Asset QR Codes (Mapped to real items in database inventory) ───────────
  {
    filename: 'qr-asset-macbook.png',
    data: 'DEV-10025',
    title: 'MacBook Pro M3 Max (DEV-10025)',
  },
  {
    filename: 'qr-asset-thinkpad.png',
    data: 'TV-LAP-02481',
    title: 'ThinkPad X1 Carbon Gen 11 (TV-LAP-02481)',
  },
  {
    filename: 'qr-asset-monitor.png',
    data: 'TV-MON-09124',
    title: 'LG 34" UltraWide Curved Monitor (TV-MON-09124)',
  },
  {
    filename: 'qr-asset-keyboard.png',
    data: 'DEV-20411',
    title: 'Keychron Q1 Pro Keyboard (DEV-20411)',
  },
  {
    filename: 'qr-asset-ultrasharp.png',
    data: 'TV-MT-0001',
    title: 'Dell UltraSharp 27 4K Monitor (TV-MT-0001)',
  },
  {
    filename: 'qr-asset-json.png',
    data: JSON.stringify({ assetCode: 'DEV-30512', type: 'asset' }),
    title: 'iPad Pro 12.9 (DEV-30512 JSON format)',
  },

  // ── Authenticator / TOTP QR Codes ──────────────────────────────────────────
  {
    filename: 'qr-auth-github.png',
    data: 'otpauth://totp/GitHub:ashiq@company.com?secret=JBSWY3DPEHPK3PXP&issuer=GitHub&algorithm=SHA1&digits=6&period=30',
    title: 'GitHub 2FA Authenticator',
  },
  {
    filename: 'qr-auth-google.png',
    data: 'otpauth://totp/Google%20Workspace:ashiq@company.com?secret=MZXW633PN5XW6MZX&issuer=Google%20Workspace&algorithm=SHA1&digits=6&period=30',
    title: 'Google Workspace 2FA',
  },
  {
    filename: 'qr-auth-aws.png',
    data: 'otpauth://totp/AWS:production-admin?secret=HXDMVJECJJWSRB3H&issuer=AWS&algorithm=SHA1&digits=6&period=30',
    title: 'Amazon Web Services (AWS)',
  },
  {
    filename: 'qr-auth-slack.png',
    data: 'otpauth://totp/Slack:ashiq@techversantinfo.com?secret=GEZDGNBVGY3TQOJQ&issuer=Slack&algorithm=SHA1&digits=6&period=30',
    title: 'Slack Enterprise Authenticator',
  },
  {
    filename: 'qr-auth-microsoft.png',
    data: 'otpauth://totp/Microsoft:ashiq@company.com?secret=KVKFKRSTOVZCA3CS&issuer=Microsoft&algorithm=SHA1&digits=6&period=30',
    title: 'Microsoft 365 Authenticator',
  },
];

async function generateAll() {
  console.log(`Generating ${qrList.length} testing QR codes in /public ...`);

  for (const item of qrList) {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&ecc=M&margin=15&data=${encodeURIComponent(item.data)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const destPath = path.join(publicDir, item.filename);
      fs.writeFileSync(destPath, buffer);
      console.log(`✓ Saved: ${item.filename} (${item.title}) [${buffer.length} bytes]`);
    } catch (err) {
      console.error(`✗ Failed for ${item.filename}:`, err.message);
    }
  }

  console.log('\nAll QR codes generated and saved in public/ successfully!');
}

generateAll();
