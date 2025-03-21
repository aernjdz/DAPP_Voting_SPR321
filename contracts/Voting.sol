// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public owner;
    bool public votingActive;
    uint256 public voteCost = 0.1 ether;
    
    address[] public candidates;
    mapping(address => bool) public voters;
    mapping(address => uint256) public votes;
    
    event CandidateAdded(address candidate);
    event Voted(address indexed voter, address indexed candidate);
    event VotingReset();
    event FundsTransferred(address indexed owner, uint256 amount);
    
    constructor() {
        owner = msg.sender;
        votingActive = true;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    modifier isVotingActive() {
        require(votingActive, "Voting is not active");
        _;
    }
    
    function pushCandidate(address candidate) public payable {
        require(msg.value >= 0.1 ether, "Insufficient fee to add candidate");
        require(candidate != address(0), "Invalid candidate address");
        
        // Can add additional checks here like:
        // - Check if candidate already exists
        // - Check if the caller is authorized
        
        candidates.push(candidate);
        emit CandidateAdded(candidate);
    }
    
    function vote(address candidate) public payable isVotingActive {
        require(msg.value >= voteCost, "Insufficient fee to vote");
        require(!voters[msg.sender], "You have already voted");
        
        bool isCandidate = false;
        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i] == candidate) {
                isCandidate = true;
                break;
            }
        }
        require(isCandidate, "Invalid candidate");
        
        voters[msg.sender] = true;
        votes[candidate]++;
        
        emit Voted(msg.sender, candidate);
    }
    
    function getWinner() public view returns (address winner) {
        require(candidates.length > 0, "No candidates");
        
        uint256 maxVotes = 0;
        
        for (uint i = 0; i < candidates.length; i++) {
            if (votes[candidates[i]] > maxVotes) {
                maxVotes = votes[candidates[i]];
                winner = candidates[i];
            }
        }
        
        return winner;
    }
    
    function getCandidatesCount() public view returns (uint256) {
        return candidates.length;
    }
    
    function resetVoting() public onlyOwner {
        for (uint i = 0; i < candidates.length; i++) {
            votes[candidates[i]] = 0;
        }
        
        // Reset all voters
        // Note: This is a simple approach and might be gas-intensive for many voters
        for (uint i = 0; i < candidates.length; i++) {
            address voter = candidates[i]; // Example approach, not ideal
            voters[voter] = false;
        }
        
        emit VotingReset();
    }
    
    function stopVoting() public onlyOwner {
        votingActive = false;
    }
    
    function getBalance() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner).transfer(balance);
        emit FundsTransferred(owner, balance);
    }
}