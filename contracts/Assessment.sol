// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public accountHolder;
    uint256 public accountBalance;

    event Deposited(address indexed depositor, uint256 amount);
    event Withdrawn(address indexed withdrawer, uint256 amount);
    event Transferred(address indexed sender, address indexed recipient, uint256 amount);

    constructor(uint256 initialBalance) payable {
        accountHolder = payable(msg.sender);
        accountBalance = initialBalance;
    }

    function getBalance() public view returns (uint256) {
        return accountBalance;
    }

    function deposit(uint256 depositAmount) public payable {
        require(msg.sender == accountHolder, "Only the account holder can deposit");
        require(depositAmount > 0, "Deposit amount must be greater than zero");
        accountBalance += depositAmount;
        emit Deposited(msg.sender, depositAmount);
    }

    error InsufficientFunds(uint256 currentBalance, uint256 withdrawalAmount);

    function withdraw(uint256 withdrawalAmount) public {
        require(msg.sender == accountHolder, "Only the account holder can withdraw");
        if (accountBalance < withdrawalAmount) {
            revert InsufficientFunds({ currentBalance: accountBalance, withdrawalAmount: withdrawalAmount });
        }
        accountBalance -= withdrawalAmount;
        emit Withdrawn(msg.sender, withdrawalAmount);
    }
    function transfer(address payable recipient, uint256 transferAmount) public {
        require(msg.sender == accountHolder, "Only the account holder can initiate a transfer");
        require(transferAmount > 0, "Transfer amount must be greater than zero");
        require(accountBalance >= transferAmount, "Insufficient funds for transfer");
        accountBalance -= transferAmount;
        recipient.transfer(transferAmount);
        emit Transferred(msg.sender, recipient, transferAmount);
    }

   
    function donate(address payable charity, uint256 donationAmount) public payable {
        require(donationAmount > 0, "Donation amount must be greater than zero");
        require(msg.value == donationAmount, "Incorrect donation amount sent");
        charity.transfer(donationAmount);
    }

    function multiply(uint256 number1, uint256 number2) public pure returns (uint256) {
        return number1 * number2;
    }
}
