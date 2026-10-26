// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MessageBoard {
    string private message;

    event MessagePosted(address indexed sender, string message);

    function postMessage(string memory newMessage) public {
        message = newMessage;
        emit MessagePosted(msg.sender, newMessage);
    }

    function getMessageContent() public view returns (string memory) {
        return message;
    }
}
