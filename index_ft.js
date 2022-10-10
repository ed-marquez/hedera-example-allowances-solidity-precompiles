console.clear();
import { Client, AccountId, PrivateKey, Hbar } from "@hashgraph/sdk";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("dotenv").config();

import accountCreateFcn from "./utils/accountCreate.js";
import * as approvals from "./utils/allowanceApprovals.js";
import * as transfers from "./utils/allowanceTransfers.js";
import * as queries from "./utils/queries.js";
import * as htsTokens from "./utils/tokenOperations.js";

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Creating Hedera accounts and HTS token...\n`);

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

	const [tokenId, tokenInfo] = await htsTokens.createFtFcn("HBAR ROCKS", "HROCK", 100, treasuryId, treasuryKey, client);
	console.log(`\n- Token ID: ${tokenId}`);
	console.log(`- Initial token supply: ${tokenInfo.totalSupply.low}`);

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Treasury approving fungible token allowance for Alice...\n`);

	let allowBal = 50;
	const allowanceApproveFtRx = await approvals.ftAllowanceFcn(tokenId, treasuryId, aliceId, allowBal, treasuryKey, client);
	console.log(`- Allowance approval status: ${allowanceApproveFtRx.status}`);
	console.log(`- https://testnet.mirrornode.hedera.com/api/v1/accounts/${treasuryId}/allowances/tokens \n`);

	await queries.balanceCheckerFcn(treasuryId, tokenId, client);
	await queries.balanceCheckerFcn(aliceId, tokenId, client);
	await queries.balanceCheckerFcn(bobId, tokenId, client);

	// STEP 3 ===================================
	console.log(`\nSTEP 3 ===================================\n`);
	console.log(`- Alice performing allowance transfer from Treasury to Bob...\n`);
	const sendBal = 45; // Spender must generate the TX ID or be the client
	const allowanceSendFtRx = await transfers.ftAllowanceFcn(tokenId, treasuryId, bobId, sendBal, aliceId, aliceKey, client);
	console.log(`- Allowance transfer status: ${allowanceSendFtRx.status} \n`);

	await queries.balanceCheckerFcn(treasuryId, tokenId, client);
	await queries.balanceCheckerFcn(aliceId, tokenId, client);
	await queries.balanceCheckerFcn(bobId, tokenId, client);

	// STEP 4 ===================================
	console.log(`\nSTEP 4 ===================================\n`);
	console.log(`- Treasury deleting fungible token allowance for Alice...\n`);
	allowBal = 0;
	const allowanceDeleteFtRx = await approvals.ftAllowanceFcn(tokenId, treasuryId, aliceId, allowBal, treasuryKey, client);
	console.log(`- Allowance deletion status: ${allowanceDeleteFtRx.status}`);
	console.log(`- https://testnet.mirrornode.hedera.com/api/v1/accounts/${treasuryId}/allowances/tokens`);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();
