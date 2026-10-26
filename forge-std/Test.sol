// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.9.0;

abstract contract Test {
    function assertEq(string memory a, string memory b) internal pure {
        require(keccak256(bytes(a)) == keccak256(bytes(b)), string(abi.encodePacked("Assertion failed: ", a, " != ", b)));
    }

    function assertEq(uint256 a, uint256 b) internal pure {
        require(a == b, "Assertion failed: uints not equal");
    }

    function assertEq(address a, address b) internal pure {
        require(a == b, "Assertion failed: addresses not equal");
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "Assertion failed: condition is false");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "Assertion failed: condition is true");
    }
}
