// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.11;
pragma experimental ABIEncoderV2;

import "./hts-precompiles/HederaTokenService.sol";
import "./hts-precompiles/HederaResponseCodes.sol";
import "./hts-precompiles/ExpiryHelper.sol";
import "./hts-precompiles/FeeHelper.sol";
import "./hts-precompiles/KeyHelper.sol";

contract ApproveAllowances is HederaTokenService {
    address htsPrecompiles = address(0x167);

    function tokenAssociate(address _account, address _tokenAddress) external returns (int){
        int response = HederaTokenService.associateToken(_account, _tokenAddress);

        if (response != HederaResponseCodes.SUCCESS) {
            // revert ("allowance Failed");
            return response;
        }
        return response;
    }

    function getBalance() public view returns (uint) {
        return address(this).balance;
    }

    //============================================ 
    // FUNGIBLE TOKENS
    //============================================ 
    
    function approveFt( address _tokenAddress, address _spender, uint256 _amount) external returns (int) {
        htsPrecompiles.delegatecall(abi.encodeWithSelector(IHederaTokenService.approve.selector,_tokenAddress, _spender, _amount)); 
    }

    function ftTransferApproved(address _tokenAddress, address _owner, address _receiver, uint256 _amount) external returns (int) {
        htsPrecompiles.delegatecall(abi.encodeWithSelector(IHederaTokenService.transferFrom.selector, _tokenAddress, _owner, _receiver, _amount)); 
    }

    function getAllowance4Ft(address _tokenAddress, address _owner, address _spender) external returns (uint256) {
        (int responseCode, uint256 amount) = HederaTokenService.allowance(_tokenAddress, _owner, _spender); 
        if (responseCode != HederaResponseCodes.SUCCESS) {
            // revert ("allowance Failed");
            return amount;
        }
        return amount;
    }

    //============================================ 
    // NON-FUNGIBLE TOKENS
    //============================================ 

    function approveNft(address _tokenAddress, address _spender, uint256 _serialNumber) external returns (int) {
        htsPrecompiles.delegatecall(abi.encodeWithSelector(IHederaTokenService.approveNFT.selector,_tokenAddress, _spender, _serialNumber)); 
    }

    function approveAllNfts(address _tokenAddress, address _spender, bool _approveOrRevoke) external returns (int) {
        int responseCode  = HederaTokenService.setApprovalForAll(_tokenAddress, _spender, _approveOrRevoke); 
        if (responseCode != HederaResponseCodes.SUCCESS) {
            // revert ("allowance Failed");
            return responseCode;
        }
        return responseCode;
    }
    
    function nftTransferApproved(address _tokenAddress, address _owner, address _receiver, uint256 _serial) external returns (int) {
        htsPrecompiles.delegatecall(abi.encodeWithSelector(IHederaTokenService.transferFromNFT.selector, _tokenAddress, _owner, _receiver, _serial)); 
    }

    // Queries
    function getApprovedAddress4Nft(address _tokenAddress, uint256 _serialNumber) external returns (address) {
        (int responseCode , address approved) = HederaTokenService.getApproved(_tokenAddress, _serialNumber); 
        if (responseCode != HederaResponseCodes.SUCCESS) {
            // revert ("allowance Failed");
            return approved;
        }
        return approved;
    }
    
    function getApprovedAddress4AllNfts(address _tokenAddress, address _owner, address _spender) external returns (bool) {
        (int responseCode , bool approved) = HederaTokenService.isApprovedForAll(_tokenAddress, _owner, _spender); 
        if (responseCode != HederaResponseCodes.SUCCESS) {
            // revert ("allowance Failed");
            return approved;
        }
        return approved;
    }
}