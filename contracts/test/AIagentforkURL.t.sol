// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;


import "../lib/forge-std/src/Test.sol";
import "../src/GudScanner.sol";
import "../lib/openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";


contract AIagentVaultForkTest is Test {
    AIagentVault vault;
    IERC20 usdc;
    address owner;
    address agent;
    address user;


    address constant USDC_MAINNET = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address constant USDC_BASE = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address constant USDC_WHALE = 0x4E3560437DD1F478ba8bb3dC2653071287aF7C89; //0x9217290AA5425e127b8a40BB5d48401Bb8E3e084;(mainnet)


    function setUp() public {
        // Fork mainnet
        string memory forkUrl = vm.envString("BASE_RPC_URL");
        uint256 forkBlock = 33992164; // Use a recent stable block
        uint256 forkId = vm.createFork(forkUrl, forkBlock);
        vm.selectFork(forkId);


        owner = makeAddr("owner");
        agent = makeAddr("agent");
        user = makeAddr("user");

        // Deploy vault
        vm.startPrank(owner);
        vault = new AIagentVault(IERC20(USDC_BASE));
        vault.setAuthorizedAgent(agent);
        vm.stopPrank();
        console.log(address(vault));


        usdc = IERC20(USDC_BASE);


        // Fund user with USDC from whale
        vm.startPrank(USDC_WHALE);
        usdc.transfer(user, 10e6); // 10 USDC
        vm.stopPrank();


        // User deposits into vault
        vm.startPrank(user);
        usdc.approve(address(vault), 10e6);
        vault.deposit(5e6); // Deposit 5 USDC
        vm.stopPrank();


        // Lock vault for trading
        vm.prank(owner);
        vault.setLock(true);
    }


    function testAgentExecutesGudTradeWithAPI() public {
        // Skip if no API key is available (for CI/CD)
        string memory apiKey = vm.envOr("API_KEY", string(""));
        if (bytes(apiKey).length == 0) {
            console.log("Skipping API test - no API_KEY provided");
            return;
        }


        // Get trade data from API via FFI
        string[] memory cmd = new string[](2);
        cmd[0] = "node";
        cmd[1] = "script/getQuote.js";
        
        bytes memory apiResponse;
        try vm.ffi(cmd) returns (bytes memory response) {
            apiResponse = response;
            console.log("API Response received, length:", response.length);
        } catch Error(string memory reason) {
            console.log("Skipping API test - FFI call failed:", reason);
            return;
        } catch {
            console.log("Skipping API test - FFI call failed (unknown error)");
            return;
        }


        // Validate response is not empty
        if (apiResponse.length == 0) {
            console.log("Skipping API test - empty response");
            return;
        }


        (address to, bytes memory data, uint256 value) = parseQuote(apiResponse);


        console.log("Trade target:", to);
        console.log("Trade value:", value);
        console.log("Trade data length:", data.length);


        // Verify the trade parameters
        assertEq(value, 0, "ETH value should be 0 for ERC20 trades");
        assertTrue(to != address(0), "Trade target should not be zero address");
        assertTrue(data.length > 0, "Trade data should not be empty");


        // Record vault balance before trade
        uint256 usdcBalanceBefore = usdc.balanceOf(address(vault));
        uint256 ethBalanceBefore = address(vault).balance;


        // Execute the trade
        vm.expectEmit(false, false, false, false);
        emit AIagentVault.GudTradeExecuted(USDC_MAINNET, 5e6, to);


        vm.prank(agent);
        vault.agentExecuteGudTrade(
            AIagentVault.GudTrade({to: to, value: value, data: data}),
            USDC_BASE,
            5e6 // Trade 5 USDC
        );


        // Verify trade was executed
        uint256 usdcBalanceAfter = usdc.balanceOf(address(vault));
        uint256 ethBalanceAfter = address(vault).balance;


        console.log("USDC balance before:", usdcBalanceBefore);
        console.log("USDC balance after:", usdcBalanceAfter);
        console.log("ETH balance before:", ethBalanceBefore);
        console.log("ETH balance after:", ethBalanceAfter);


        // The exact outcome depends on the trade, but we can verify the transaction succeeded
        // and that some state change occurred
        assertTrue(usdcBalanceAfter != usdcBalanceBefore || ethBalanceAfter != ethBalanceBefore, 
                  "Trade should have caused a balance change");
    }


    function testAgentExecutesGudTradeWithMockData() public {
        // Test with mock data when API is not available
        address mockTarget = address(new MockDEX());
        
        // Mint some mock tokens to simulate a swap
        MockToken mockToken = new MockToken("Mock Token", "MOCK");
        mockToken.mint(address(vault), 1000e18);


        bytes memory swapData = abi.encodeWithSelector(
            MockDEX.swapExactTokensForTokens.selector,
            5e6, // Trade 5 USDC
            0, // min amount out
            USDC_BASE,
            address(mockToken)
        );


        AIagentVault.GudTrade memory trade = AIagentVault.GudTrade({
            to: mockTarget,
            value: 0,
            data: swapData
        });


        uint256 balanceBefore = usdc.balanceOf(address(vault));


        vm.prank(agent);
        // CORRECTED: The amount here now matches the amount in swapData
        vault.agentExecuteGudTrade(trade, USDC_BASE, 5e6);


        uint256 balanceAfter = usdc.balanceOf(address(vault));
        
        // Verify USDC was transferred out (spent in trade)
        assertLt(balanceAfter, balanceBefore, "USDC should have been spent in trade");
    }


    function testWithdrawAfterProfitableTrade() public {
        // CORRECTED: Use a variable for the principal to avoid magic numbers
        uint256 userPrincipal = 5e6; // This matches the deposit in setUp()

        // Simulate a profitable trade by adding tokens to vault
        // Let's add 2 USDC profit
        usdc.transfer(address(vault), 2e6);


        // Unlock vault
        vm.prank(owner);
        vault.setLock(false);


        uint256 userBalanceBefore = usdc.balanceOf(user);
        
        // User withdraws all their principal
        vm.prank(user);
        // CORRECTED: Withdraw the actual principal amount
        vault.withdraw(userPrincipal);


        uint256 userBalanceAfter = usdc.balanceOf(user);
        uint256 payout = userBalanceAfter - userBalanceBefore;


        // User should receive more than their principal due to profits
        // CORRECTED: Assert against the correct principal amount
        assertGt(payout, userPrincipal, "User should receive profits in addition to principal");
        console.log("Amount received:", payout);
        // CORRECTED: Calculate profit based on the correct principal
        console.log("Profit:", payout - userPrincipal);
    }


    function parseQuote(bytes memory response) internal pure returns (address, bytes memory, uint256) {
        // Convert bytes to string and parse
        string memory responseStr = string(response);
        console.log("Parsing response:", responseStr);
        
        // Split by spaces: "to data value"
        string[] memory parts = splitString(responseStr, " ");
        
        require(parts.length >= 3, "Invalid response format - expected 'to data value'");
        
        // Parse address (remove any whitespace)
        address to = vm.parseAddress(trim(parts[0]));
        
        // Parse data (remove any whitespace) 
        bytes memory data = vm.parseBytes(trim(parts[1]));
        
        // Parse value (remove any whitespace)
        uint256 value = vm.parseUint(trim(parts[2]));
        
        console.log("Parsed - to:", to);
        console.log("Parsed - data length:", data.length);
        console.log("Parsed - value:", value);
        
        return (to, data, value);
    }


    function splitString(string memory str, string memory delimiter) internal pure returns (string[] memory) {
        bytes memory strBytes = bytes(str);
        bytes memory delimiterBytes = bytes(delimiter);
        
        // Count occurrences of delimiter
        uint256 count = 1;
        for (uint256 i = 0; i <= strBytes.length - delimiterBytes.length; i++) {
            bool _match = true;
            for (uint256 j = 0; j < delimiterBytes.length; j++) {
                if (strBytes[i + j] != delimiterBytes[j]) {
                    _match = false;
                    break;
                }
            }
            if (_match) {
                count++;
                i += delimiterBytes.length - 1;
            }
        }
        
        // Split string
        string[] memory parts = new string[](count);
        uint256 partIndex = 0;
        uint256 lastIndex = 0;
        
        for (uint256 i = 0; i <= strBytes.length - delimiterBytes.length; i++) {
            bool _match = true;
            for (uint256 j = 0; j < delimiterBytes.length; j++) {
                if (strBytes[i + j] != delimiterBytes[j]) {
                    _match = false;
                    break;
                }
            }
            if (_match) {
                // Extract substring
                bytes memory partBytes = new bytes(i - lastIndex);
                for (uint256 k = 0; k < i - lastIndex; k++) {
                    partBytes[k] = strBytes[lastIndex + k];
                }
                parts[partIndex] = string(partBytes);
                partIndex++;
                lastIndex = i + delimiterBytes.length;
                i += delimiterBytes.length - 1;
            }
        }
        
        // Add final part
        bytes memory finalPartBytes = new bytes(strBytes.length - lastIndex);
        for (uint256 k = 0; k < strBytes.length - lastIndex; k++) {
            finalPartBytes[k] = strBytes[lastIndex + k];
        }
        parts[partIndex] = string(finalPartBytes);
        
        return parts;
    }
    
    function trim(string memory str) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        uint256 start = 0;
        uint256 end = strBytes.length;
        
        // Trim leading whitespace
        while (start < end && (strBytes[start] == 0x20 || strBytes[start] == 0x09 || strBytes[start] == 0x0a || strBytes[start] == 0x0d)) {
            start++;
        }
        
        // Trim trailing whitespace  
        while (end > start && (strBytes[end - 1] == 0x20 || strBytes[end - 1] == 0x09 || strBytes[end - 1] == 0x0a || strBytes[end - 1] == 0x0d)) {
            end--;
        }
        
        bytes memory trimmedBytes = new bytes(end - start);
        for (uint256 i = 0; i < end - start; i++) {
            trimmedBytes[i] = strBytes[start + i];
        }
        
        return string(trimmedBytes);
    }
}


// Mock contracts for testing
contract MockDEX {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut
    ) external {
        // Mock swap - just transfer tokens
        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
        // In a real swap, we'd give back tokenOut
    }
}


contract MockToken is IERC20 {
    string public name;
    string public symbol;
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
        totalSupply += amount;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(balanceOf[from] >= amount, "Insufficient balance");
        require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
        
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        allowance[from][msg.sender] -= amount;
        
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }
}
