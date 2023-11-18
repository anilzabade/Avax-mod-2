// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Assessment {
    address payable public owner;
    uint256 public balance;

    event Deposit(address indexed account, uint256 amount);
    event Withdraw(address indexed account, uint256 amount);
    event PurchaseMembership(address indexed account);
    event MembershipStatus(address indexed account, string status);

    mapping(address => bool) public isMember;

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner of this account");
        _;
    }

    constructor(uint256 initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns (uint256) {
        return balance;
    }

    function deposit(uint256 _amount) public payable onlyOwner {
        uint256 _previousBalance = balance;

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(msg.sender, _amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public onlyOwner {
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(msg.sender, _withdrawAmount);
    }

    function purchaseMembership() public {
        require(!isMember[msg.sender], "Already a gym member");
        isMember[msg.sender] = true;

        // emit the event
        emit PurchaseMembership(msg.sender);
    }

    function membershipStatus() public view returns (string memory) {
        string memory status;
        if (isMember[msg.sender]) {
            status = "There is an active gym membership";
        } else {
            status = "No active gym membership";
        }

        return status;
    }
}
