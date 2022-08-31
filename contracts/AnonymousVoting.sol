//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IAnonymousVoting.sol";
import "./base/SemaphoreCore.sol";
import "./base/SemaphoreGroups.sol";

/// @title Anonymous voting contract.
/// @dev The following code allows you to create polls, add voters and allow them to vote anonymously.
contract AnonymousVoting is IAnonymousVoting, SemaphoreCore, SemaphoreGroups {
     /// @dev Voting verifier.
    IVerifier internal verifier;
    /// @dev Gets a poll id and returns the poll data.
    mapping(uint256 => Poll) internal polls;

    constructor(address _verifierAddress) {
        verifier = IVerifier(_verifierAddress);    
    }

    /// @dev Checks if the poll coordinator is the transaction sender.
    /// @param _pollId: Id of the poll.
    modifier onlyCoordinator(uint256 _pollId) {
        require(polls[_pollId].coordinator == _msgSender(), "AnonymousVoting: caller is not the poll coordinator");
        _;
    }

    /// @dev See {IAnonymousVoting-createPoll}.
    function createPoll(
        uint256 _pollId,
        address _coordinator,
        uint8 _depth,
        address[] memory _candidateAddresses
    ) public override {
        _createGroup(_pollId, _depth, 0);

        Poll memory poll;
        poll.coordinator = _coordinator;
        poll.candidates = _candidateAddresses;
        polls[_pollId] = poll;
        
        emit PollCreated(_pollId, _coordinator);
    }

     /// @dev See {IAnonymousVoting-addVoter}.
    function addVoter(uint256 _pollId, uint256 _identityCommitment) public override {
        require(polls[_pollId].state == PollState.Created, "AnonymousVoting: voters can only be added before voting");

        _addMember(_pollId, _identityCommitment);
    }

    /// @dev See {IAnonymousVoting-startPoll}.
    function startPoll(uint256 _pollId, string memory _encryptionKey) public override onlyCoordinator(_pollId) {
        require(polls[_pollId].state != PollState.Ongoing, "AnonymousVoting: poll has already been started");

        polls[_pollId].state = PollState.Ongoing;

        emit PollStarted(_pollId, _msgSender(), _encryptionKey);
    }

    /// @dev See {IAnonymousVoting-castVote}.
    function castVote(
        bytes32 _vote,
        uint256 _nullifierHash,
        uint256 _pollId,
        uint256[8] calldata _proof
    ) public override {
        Poll memory poll = polls[_pollId];

        require(poll.state == PollState.Ongoing, "AnonymousVoting: vote can only be cast in an ongoing poll");

        //uint8 depth = getDepth(_pollId);
        uint256 root = getRoot(_pollId);
        //IVerifier verifier = verifiers[depth];

        _verifyProof(_vote, root, _nullifierHash, _pollId, _proof, verifier);

        // Prevent double-voting (nullifierHash = hash(_pollId + identityNullifier)).
        _saveNullifierHash(_nullifierHash);

        emit VoteAdded(_pollId, _vote);
    }

    /// @dev See {IAnonymousVoting-endPoll}.
    function endPoll(uint256 _pollId, string memory _decryptionKey) public override onlyCoordinator(_pollId) {
        require(polls[_pollId].state == PollState.Ongoing, "AnonymousVoting: poll is not ongoing");

        polls[_pollId].state = PollState.Ended;

        emit PollEnded(_pollId, _msgSender(), _decryptionKey);
    }
  
    /// @dev See {IAnonymousVoting-getCoordinator}.
    function getCoordinator(uint256 _pollId) public override view returns(address) {
        return polls[_pollId].coordinator;
    }

    /// @dev See {IAnonymousVoting-getCandidates}.
    function getCandidates(uint256 _pollId) public override view returns(address[] memory) {
        return polls[_pollId].candidates;
    }

    /// @dev See {IAnonymousVoting-getPollState}.
    function getPollState(uint256 _pollId) public override view returns(uint8) {
        return uint8(polls[_pollId].state);
    }
}