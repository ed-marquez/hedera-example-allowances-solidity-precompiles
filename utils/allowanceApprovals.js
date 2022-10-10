import { AccountAllowanceApproveTransaction, AccountAllowanceDeleteTransaction, NftId } from "@hashgraph/sdk";

export async function hbarAllowanceFcn(owner, spender, allowBal, pvKey, client) {
	const allowanceTx = new AccountAllowanceApproveTransaction().approveHbarAllowance(owner, spender, allowBal).freezeWith(client);
	const allowanceSign = await allowanceTx.sign(pvKey);
	const allowanceSubmit = await allowanceSign.execute(client);
	const allowanceRx = await allowanceSubmit.getReceipt(client);

	return allowanceRx;
}

export async function ftAllowanceFcn(tId, owner, spender, allowBal, pvKey, client) {
	const allowanceTx = new AccountAllowanceApproveTransaction().approveTokenAllowance(tId, owner, spender, allowBal).freezeWith(client);
	const allowanceSign = await allowanceTx.sign(pvKey);
	const allowanceSubmit = await allowanceSign.execute(client);
	const allowanceRx = await allowanceSubmit.getReceipt(client);

	return allowanceRx;
}

export async function nftAllowanceFcn(tId, owner, spender, nft2Approve, pvKey, client) {
	const allowanceTx = new AccountAllowanceApproveTransaction()
		// .approveTokenNftAllowanceAllSerials(tId, owner, spender) // Can approve all serials under a NFT collection
		.approveTokenNftAllowance(nft2Approve[0], owner, spender) // Or can approve individual serials under a NFT collection
		.approveTokenNftAllowance(nft2Approve[1], owner, spender)
		.approveTokenNftAllowance(nft2Approve[2], owner, spender)
		.freezeWith(client);
	const allowanceSign = await allowanceTx.sign(pvKey);
	const allowanceSubmit = await allowanceSign.execute(client);
	const allowanceRx = await allowanceSubmit.getReceipt(client);

	return allowanceRx;
}

export async function nftAllowanceDeleteFcn(owner, nft2disallow, pvKey, client) {
	const allowanceTx = new AccountAllowanceDeleteTransaction()
		.deleteAllTokenNftAllowances(nft2disallow[0], owner)
		.deleteAllTokenNftAllowances(nft2disallow[1], owner)
		.freezeWith(client);
	const allowanceSign = await allowanceTx.sign(pvKey);
	const allowanceSubmit = await allowanceSign.execute(client);
	const allowanceRx = await allowanceSubmit.getReceipt(client);

	return allowanceRx;
}
