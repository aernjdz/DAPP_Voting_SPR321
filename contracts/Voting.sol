// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract Voting {
    address public owner;
    mapping(address => uint) public votes; 
    mapping(address => bool) public voters; 
    address[] public candidates; 
    uint public voteCost = 0.1 ether; 
    bool public votingActive = true;

    event CandidateAdded(address candidate);
    event Voted(address indexed voter, address indexed candidate);
    event FundsTransferred(address indexed owner, uint amount);
    event VotingReset();

    constructor() public {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }

    modifier onlyWhenVotingActive() {
        require(votingActive, "Voting is not active");
        _;
    }

    function pushCandidate(address candidate) public payable onlyOwner {
        require(msg.value >= voteCost, "You must pay the voting fee to add a candidate");
        candidates.push(candidate);
        emit CandidateAdded(candidate);
    }

    function vote(address candidate) public payable onlyWhenVotingActive {
        require(msg.value >= voteCost, "You must pay the voting fee to vote");
        require(!voters[msg.sender], "You have already voted");

        bool isValidCandidate = false;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == candidate) {
                isValidCandidate = true;
                votes[candidate]++;
                voters[msg.sender] = true;
                emit Voted(msg.sender, candidate);
                break;
            }
        }
        require(isValidCandidate, "Candidate does not exist");
    }

    function getWinner() public view returns (address winner) {
        require(candidates.length > 0, "No candidates available");
        winner = candidates[0];
        for (uint i = 1; i < candidates.length; i++) {
            if (votes[candidates[i]] > votes[winner]) {
                winner = candidates[i];
            }
        }
        return winner;
    }

    function getBalance() public onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No funds available");
        payable(owner).transfer(balance);
        emit FundsTransferred(owner, balance);
    }

    // Reset function to clear votes and candidates and allow for new elections
    function resetVoting() public onlyOwner {
        delete candidates;
        for (uint i = 0; i < candidates.length; i++) {
            delete votes[candidates[i]];
        }
        votingActive = true;
        emit VotingReset();
    }

    function stopVoting() public onlyOwner {
        votingActive = false;
    }
        function getCandidatesCount() public view returns (uint) {
        return candidates.length;
    }
}
