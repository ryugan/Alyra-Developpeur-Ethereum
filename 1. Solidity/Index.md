================================
==        Debuging Test       ==
================================

Admin action => "=="
Voter action => "--"

== Deploy ==
=> Admin : 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4

== Add Voter ==
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 2
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db 2
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB 2

== Proposal Start ==

-- Propose --
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 23
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db 42
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB 23 => KO exists

== Proposal End ==

== Vote Start ==

-- Vote --
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 23
0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db 42
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB 23

== End End ==

-- Get Vote -- 
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 => 23

== Determine Proposal ==

-- Get Winner --
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 => 23

== Reset ==

-- Get Vote -- 
0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB 0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 => Error

-- Get Winner --
0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2 => Error

== Get current workflowStatus ==
=> 1