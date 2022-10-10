console.clear();
import { Client, AccountId, PrivateKey, Hbar } from "@hashgraph/sdk";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import accountCreateFcn from "./utils/accountCreate.js";
import * as approvals from "./utils/allowanceApprovals.js";
import * as transfers from "./utils/allowanceTransfers.js";
import * as queries from "./utils/queries.js";

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Creating Hedera accounts...\n`);

	const initBalance = new Hbar(10);
	const treasuryKey = PrivateKey.generateED25519();
	const [treasurySt, treasuryId] = await accountCreateFcn(treasuryKey, initBalance, client);
	console.log(`- Treasury's account: https://hashscan.io/#/testnet/account/${treasuryId}`);
	const aliceKey = PrivateKey.generateED25519();
	const [aliceSt, aliceId] = await accountCreateFcn(aliceKey, initBalance, client);
	console.log(`- Alice's account: https://hashscan.io/#/testnet/account/${aliceId}`);
	const bobKey = PrivateKey.generateED25519();
	const [bobSt, bobId] = await accountCreateFcn(bobKey, initBalance, client);
	console.log(`- Bob's account: https://hashscan.io/#/testnet/account/${bobId}`);

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Treasury approving HBAR allowance for Alice...\n`);

	let allowBal = new Hbar(10);
	const allowanceApproveHbarRx = await approvals.hbarAllowanceFcn(treasuryId, aliceId, allowBal, treasuryKey, client);
	console.log(`- Allowance approval status: ${allowanceApproveHbarRx.status}`);
	console.log(`- https://testnet.mirrornode.hedera.com/api/v1/accounts/${treasuryId}/allowances/crypto \n`);

	await queries.balanceCheckerFcn(treasuryId, [], client);
	await queries.balanceCheckerFcn(aliceId, [], client);
	await queries.balanceCheckerFcn(bobId, [], client);

	// STEP 3 ===================================
	console.log(`\nSTEP 3 ===================================\n`);
	console.log(`- Alice performing allowance transfer from Treasury to Bob...\n`);
	const sendBal = new Hbar(8); // Spender must generate the TX ID or be the client
	const allowanceSendHbarRx = await transfers.hbarAllowanceFcn(treasuryId, bobId, sendBal, aliceId, aliceKey, client);
	console.log(`- Allowance transfer status: ${allowanceSendHbarRx.status} \n`);

	await queries.balanceCheckerFcn(treasuryId, [], client);
	await queries.balanceCheckerFcn(aliceId, [], client);
	await queries.balanceCheckerFcn(bobId, [], client);

	// STEP 4 ===================================
	console.log(`\nSTEP 4 ===================================\n`);
	console.log(`- Treasury deleting HBAR allowance for Alice...\n`);
	allowBal = new Hbar(0);
	const allowanceDeleteHbarRx = await approvals.hbarAllowanceFcn(treasuryId, aliceId, allowBal, treasuryKey, client);
	console.log(`- Allowance deletion status: ${allowanceDeleteHbarRx.status}`);
	console.log(`- https://testnet.mirrornode.hedera.com/api/v1/accounts/${treasuryId}/allowances/crypto`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();
