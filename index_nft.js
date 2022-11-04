console.clear();
import { Client, AccountId, PrivateKey, Hbar, ContractFunctionParameters } from "@hashgraph/sdk";

import dotenv from "dotenv";
dotenv.config();
import fs from "fs";

import accountCreateFcn from "./utils/accountCreate.js";
import * as queries from "./utils/queries.js";
import * as htsTokens from "./utils/tokenOperations.js";
import * as contracts from "./utils/contractOperations.js";

const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY);
const client = Client.forTestnet().setOperator(operatorId, operatorKey);
client.setDefaultMaxTransactionFee(new Hbar(100));

async function main() {
	// STEP 1 ===================================
	console.log(`\nSTEP 1 ===================================\n`);
	console.log(`- Creating Hedera accounts, HTS token, and contract...\n`);

	// Accounts
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

	//Token
	const [tokenId, tokenInfo] = await htsTokens.createMintNftFcn("HBAR ROCKS NFT", "HROCKNFT", 0, 100, treasuryId, treasuryKey, client);
	const tokenAddressSol = tokenId.toSolidityAddress();
	console.log(`\n- Token ID: ${tokenId}`);
	console.log(`- Token ID in Solidity format: ${tokenAddressSol}`);
	console.log(`- Initial token supply: ${tokenInfo.totalSupply.low}`);

	// Contract
	// Import the compiled contract bytecode
	const bytecode = fs.readFileSync("./binaries/ApproveAllowances.bin");
	let gasLim = 100000;
	const [contractId, contractAddress] = await contracts.deployContractFcn(bytecode, gasLim, client);
	console.log(`\n- Contract ID: ${contractId}`);
	console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

	// STEP 2 ===================================
	console.log(`\nSTEP 2 ===================================\n`);
	console.log(`- Treasury approving NFT allowance for Alice...\n`);

	gasLim = 4000000;
	let nft2approve = 1;
	const allowanceApproveNftParams = new ContractFunctionParameters()
		.addAddress(tokenAddressSol)
		.addAddress(aliceId.toSolidityAddress())
		.addUint256(nft2approve);

	client.setOperator(treasuryId, treasuryKey);
	const allowanceApproveNftRec = await contracts.executeContractFcn(contractId, "approveNft", allowanceApproveNftParams, gasLim, client);
	client.setOperator(operatorId, operatorKey);
	console.log(`- Contract call for NFT allowance approval: ${allowanceApproveNftRec.receipt.status}`);

	const [allowanceApproveNftInfo, allowanceApproveNftExpUrl] = await queries.mirrorTxQueryFcn(allowanceApproveNftRec.transactionId);
	console.log(`- See details: ${allowanceApproveNftExpUrl} \n`);

	await queries.balanceCheckerFcn(treasuryId, tokenId, client);
	await queries.balanceCheckerFcn(aliceId, tokenId, client);
	await queries.balanceCheckerFcn(bobId, tokenId, client);

	// STEP 3 ===================================
	console.log(`\nSTEP 3 ===================================\n`);
	console.log(`- Alice performing allowance transfer from Treasury to Bob...\n`);

	const allowanceSendNftParams = new ContractFunctionParameters()
		.addAddress(tokenAddressSol)
		.addAddress(treasuryId.toSolidityAddress())
		.addAddress(bobId.toSolidityAddress())
		.addUint256(nft2approve);

	client.setOperator(aliceId, aliceKey);
	const allowanceSendNftRec = await contracts.executeContractFcn(contractId, "nftTransferApproved", allowanceSendNftParams, gasLim, client);
	client.setOperator(operatorId, operatorKey);
	console.log(`- Contract call for approved NFT transfer: ${allowanceSendNftRec.receipt.status}`);

	const [allowanceSendNftInfo, allowanceSendNftExpUrl] = await queries.mirrorTxQueryFcn(allowanceSendNftRec.transactionId);
	console.log(`- See details: ${allowanceSendNftExpUrl} \n`);

	await queries.balanceCheckerFcn(treasuryId, tokenId, client);
	await queries.balanceCheckerFcn(aliceId, tokenId, client);
	await queries.balanceCheckerFcn(bobId, tokenId, client);

	console.log(`
====================================================
🎉🎉 THE END - NOW JOIN: https://hedera.com/discord
====================================================\n`);
}
main();
