
 // SPDX-License-Identifier: MIT
 pragma solidity ^0.8.24;

 import "forge-std/Test.sol";
 import "../src/MessageBoard.sol";

 contract MessageBoardTest is Test {
     MessageBoard messageBoard;

     function setUp() public {
         messageBoard = new MessageBoard();
     }

     function testEndToEnd() public {
         // Post the first message.
         messageBoard.postMessage("hello world");

         string memory content =
             messageBoard.getMessageContent();

         assertEq(content, "hello world");

         // Post again; this should overwrite the old message.
         messageBoard.postMessage("hello aptos");

         content = messageBoard.getMessageContent();

         assertEq(content, "hello aptos");
     }
 }
