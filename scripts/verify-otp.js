const readline = require('readline');
const { generateTotp, verifyTotpCode } = require('../src/utils/totpGenerator.ts');

const SAMPLE_CREDENTIALS = {
  github: {
    name: 'GitHub (qr-auth-github.png)',
    secret: 'JBSWY3DPEHPK3PXP',
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  },
  google: {
    name: 'Google Workspace (qr-auth-google.png)',
    secret: 'MZXW633PN5XW6MZX',
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  },
  aws: {
    name: 'AWS Console (qr-auth-aws.png)',
    secret: 'HXDMVJECJJWSRB3H',
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  },
  slack: {
    name: 'Slack (qr-auth-slack.png)',
    secret: 'GEZDGNBVGY3TQOJQ',
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  },
  microsoft: {
    name: 'Microsoft 365 (qr-auth-microsoft.png)',
    secret: 'KVKFKRSTOVZCA3CS',
    digits: 6,
    period: 30,
    algorithm: 'SHA1',
  },
};

const inputArg = process.argv[2];

if (inputArg) {
  console.log(`\n--- Testing Code: "${inputArg}" against all credentials ---`);
  let matched = false;
  for (const [key, cred] of Object.entries(SAMPLE_CREDENTIALS)) {
    const currentCode = generateTotp(cred, new Date());
    const isValid = verifyTotpCode(cred.secret, inputArg, 1, cred.period, cred.digits);
    console.log(`[${cred.name}] Expected Current Code: ${currentCode} | Match: ${isValid ? 'VALID' : 'NO'}`);
    if (isValid) matched = true;
  }
  if (matched) {
    console.log('\n SUCCESS: The code matches RFC 6238 standard verification!\n');
  } else {
    console.log('\n INVALID: The code did not match within the current time window.\n');
  }
} else {
  console.log('\n=== Live Expected OTPs Right Now ===');
  for (const [key, cred] of Object.entries(SAMPLE_CREDENTIALS)) {
    const now = new Date();
    const currentCode = generateTotp(cred, now);
    const remainingSec = 30 - (Math.floor(now.getTime() / 1000) % 30);
    console.log(`- ${cred.name}`);
    console.log(`  Live Code : [ ${currentCode.slice(0, 3)} ${currentCode.slice(3)} ] (valid for next ${remainingSec}s)`);
  }
  console.log('\nTo test a code displayed on screen, run:');
  console.log('  node scripts/verify-otp.js <6-digit-code>');
}
