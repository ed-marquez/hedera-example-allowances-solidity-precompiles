import { TransferTransaction, TransactionId } from "@hashgraph/sdk";

export async function hbarAllowanceFcn(owner, receiver, sendBal, spender, spenderPvKey, client) {
	const approvedSendTx = new TransferTransaction()
		.addApprovedHbarTransfer(owner, sendBal.negated())
		.addHbarTransfer(receiver, sendBal)
		.setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
		.freezeWith(client);
	const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
	const approvedSendSubmit = await approvedSendSign.execute(client);
	const approvedSendRx = await approvedSendSubmit.getReceipt(client);
	return approvedSendRx;
}

export async function ftAllowanceFcn(tId, owner, receiver, sendBal, spender, spenderPvKey, client) {
	const approvedSendTx = new TransferTransaction()
		.addApprovedTokenTransfer(tId, owner, -sendBal)
		.addTokenTransfer(tId, receiver, sendBal)
		.setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
		.freezeWith(client);
	const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
	const approvedSendSubmit = await approvedSendSign.execute(client);
	const approvedSendRx = await approvedSendSubmit.getReceipt(client);
	return approvedSendRx;
}

export async function nftAllowanceFcn(owner, receiver, nft2Send, spender, spenderPvKey, client) {
	const approvedSendTx = new TransferTransaction()
		.addApprovedNftTransfer(nft2Send, owner, receiver)
		.setTransactionId(TransactionId.generate(spender)) // Spender must generate the TX ID or be the client
		.freezeWith(client);
	const approvedSendSign = await approvedSendTx.sign(spenderPvKey);
	const approvedSendSubmit = await approvedSendSign.execute(client);
	const approvedSendRx = await approvedSendSubmit.getReceipt(client);
	return approvedSendRx;
}
