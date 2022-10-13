// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

contract Payments is ReentrancyGuard {
    // Variables
    address payable public immutable feeAccount; // the account that receives fees
    uint256 public immutable feePercent; // the fee percentage on sales

    event PaidRequest(
        address indexed seller,
        uint256 _price,
        uint256 _fee,
        address indexed buyer,
        string requestId
    );

    event PaidProduct(
        address indexed seller,
        uint256 _price,
        uint256 _fee,
        address indexed buyer,
        string productId
    );

    constructor(uint256 _feePercent, address _feeAccount) {
        feeAccount = payable(_feeAccount);
        feePercent = _feePercent;
    }

    function payProduct(
        address payable seller,
        uint256 fee,
        uint256 amount,
        string memory productId
    ) public payable nonReentrant {
        require(address(this).balance >= amount + fee);
        seller.transfer(amount);
        feeAccount.transfer(fee);

        // emit Paid event
        emit PaidProduct(address(seller), fee, amount, msg.sender, productId);
    }

    function payRequest(
        address payable seller,
        uint256 fee,
        uint256 amount,
        string memory requestId
    ) public payable nonReentrant {
        require(address(this).balance >= amount + fee);
        seller.transfer(amount);
        feeAccount.transfer(fee);

        // emit Paid event
        emit PaidRequest(address(seller), fee, amount, msg.sender, requestId);
    }
}
