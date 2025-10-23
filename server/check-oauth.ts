import 'dotenv/config';
import express from 'express';

async function main() {
	console.log('🔎 Checking Google OAuth configuration...');
	const gid = process.env.GOOGLE_CLIENT_ID || '';
	const gsec = process.env.GOOGLE_CLIENT_SECRET || '';
	const redirect = process.env.GOOGLE_REDIRECT_URI || '';
	const jwtSecret = process.env.JWT_SECRET || process.env.SESSION_SECRET || '';

	console.log('  GOOGLE_CLIENT_ID:', gid ? gid.slice(0, 6) + '…' + gid.slice(-4) : '(missing)');
	console.log('  GOOGLE_CLIENT_SECRET:', gsec ? gsec.slice(0, 4) + '…' : '(missing)');
	console.log('  GOOGLE_REDIRECT_URI:', redirect || '(missing)');
	console.log('  JWT/SESSION SECRET:', jwtSecret ? 'present' : '(missing)');

	let configOk = !!gid;
	if (!configOk) {
		console.log('❌ Missing GOOGLE_CLIENT_ID.');
	}

	try {
		const jsonCfgResp = await fetch('http://localhost:5000/api/auth/google/config');
		const jsonCfg = await jsonCfgResp.json();
		console.log('  /api/auth/google/config ->', jsonCfg);
	} catch (e:any) {
		console.log('  /api/auth/google/config check failed:', e.message);
	}

	try {
		const jsCfgResp = await fetch('http://localhost:5000/config.js');
		console.log('  /config.js status:', jsCfgResp.status);
	} catch (e:any) {
		console.log('  /config.js check failed:', e.message);
	}

	console.log('\n✅ Check complete. If client ID is missing, set it in .env and client/.env');
}

main().catch(err => {
	console.error('Unexpected error:', err);
	process.exit(1);
});
