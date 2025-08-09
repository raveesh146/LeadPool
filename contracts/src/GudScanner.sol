// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";

contract AIagentVault is Ownable {
    using SafeERC20 for IERC20;

    error NotAIAgent();
    error EthNotSupportedInGudTrade();

    struct GudTrade {
        address to;       // Target contract to execute trade
        uint256 value;    // ETH value (not supported here, must be zero)
        bytes data;       // Encoded calldata for the target contract
    }

    IERC20 public immutable usdc;
    mapping(address => uint256) public principal;
    uint256 public totalPrincipal;

    address public authorizedAgent;
    bool public lock; // false = deposits allowed, true = deposits locked

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 principalWithdrawn, uint256 payout);
    event AgentExecuted(uint256 usdcAmountSpent, address target);
    event GudTradeExecuted(address srcToken, uint256 srcTokenAmount, address target);
    event LockChanged(bool newLockState);
    event AuthorizedAgentChanged(address indexed oldAgent, address indexed newAgent);

    modifier onlyAuthorized() {
        if (msg.sender != authorizedAgent) revert NotAIAgent();
        _;
    }

    constructor(IERC20 _usdc) Ownable(msg.sender) {
        require(address(_usdc) != address(0), "Zero USDC address");
        usdc = _usdc;
    }

    // ==== Owner Functions ====

    function setAuthorizedAgent(address _agent) external onlyOwner {
        emit AuthorizedAgentChanged(authorizedAgent, _agent);
        authorizedAgent = _agent;
    }

    function setLock(bool _state) external onlyOwner {
        lock = _state;
        emit LockChanged(_state);
    }

    // ==== User Functions ====

    function deposit(uint256 amount) external {
        require(!lock, "Deposits locked");
        require(amount > 0, "Zero amount");

        usdc.safeTransferFrom(msg.sender, address(this), amount);
        principal[msg.sender] += amount;
        totalPrincipal += amount;

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 principalAmount) external {
        uint256 userPrincipal = principal[msg.sender];
        require(principalAmount > 0, "Zero amount");
        require(principalAmount <= userPrincipal, "Insufficient principal");
        require(totalPrincipal > 0, "No principal in vault");

        uint256 vaultBalance = usdc.balanceOf(address(this));
        uint256 payout = (vaultBalance * principalAmount) / totalPrincipal;

        principal[msg.sender] = userPrincipal - principalAmount;
        totalPrincipal -= principalAmount;

        usdc.safeTransfer(msg.sender, payout);
        emit Withdrawn(msg.sender, principalAmount, payout);
    }

    function userShare(address user) external view returns (uint256) {
        if (totalPrincipal == 0) return 0;
        return (principal[user] * 1e18) / totalPrincipal; // share in 1e18 precision
    }

    // ==== Agent Function ====

    function agentExecuteGudTrade(
        GudTrade calldata trade,
        address srcToken,
        uint256 srcTokenAmount
    ) external onlyAuthorized {
        require(lock, "Pool must be locked to trade");
        if (srcToken == address(0) || trade.value > 0) revert EthNotSupportedInGudTrade();

        IERC20 token = IERC20(srcToken);
        token.approve(trade.to, 0);
        token.approve(trade.to, srcTokenAmount);

        (bool success, ) = trade.to.call(trade.data);
        require(success, "GUD trade execution failed");

        token.approve(trade.to, 0);

        emit GudTradeExecuted(srcToken, srcTokenAmount, trade.to);
    }

    // ==== Safety ====

    function sweepToken(IERC20 token, address recipient) external onlyOwner {
        require(address(token) != address(usdc), "Cannot sweep USDC");
        uint256 bal = token.balanceOf(address(this));
        if (bal > 0) token.safeTransfer(recipient, bal);
    }

    // Reject all ETH
    receive() external payable {
        revert("Vault doesn't accept ETH");
    }

    fallback() external payable {
        revert("Vault doesn't accept ETH");
    }
}
