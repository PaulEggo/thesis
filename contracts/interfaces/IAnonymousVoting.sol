//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title AnonymousVoting interface.
/// @dev Interface of AnonymousVoting contract.
interface IAnonymousVoting {
  enum PollState {
    Created,
    Ongoing,
    Ended
  }

  struct Poll {
    address coordinator;
    PollState state;
    address[] candidates;
  }

  /// @dev Emitted when a new poll is created.
  /// @param _pollId: Id of the poll.
  /// @param _coordinator: _coordinator of the poll.
  event PollCreated(uint256 _pollId, address indexed _coordinator);

  /// @dev Emitted when a poll is started.
  /// @param _pollId: Id of the poll.
  /// @param _coordinator: _coordinator of the poll.
  /// @param _encryptionKey: Key to encrypt the poll votes.
  event PollStarted(uint256 _pollId, address indexed _coordinator, string _encryptionKey);

  /// @dev Emitted when a user votes on a poll.
  /// @param _pollId: Id of the poll.
  /// @param _vote: User encrypted vote.
  event VoteAdded(uint256 indexed _pollId, bytes32 _vote);

  /// @dev Emitted when a poll is ended.
  /// @param _pollId: Id of the poll.
  /// @param _coordinator: _coordinator of the poll.
  /// @param _decryptionKey: Key to decrypt the poll votes.
  event PollEnded(uint256 _pollId, address indexed _coordinator, string _decryptionKey);

  /// @dev Creates a poll and the associated Merkle tree/group.
  /// @param _pollId: Id of the poll.
  /// @param _coordinator: _coordinator of the poll.
  /// @param _depth: Depth of the tree.
  /// @param _candidateAddresses: Addresses of the condidates of the poll
  function createPoll(
    uint256 _pollId,
    address _coordinator,
    uint8 _depth,
    address[] memory _candidateAddresses
  ) external;

  /// @dev Adds a voter to a poll.
  /// @param _pollId: Id of the poll.
  /// @param _identityCommitment: Identity commitment of the group member.
  function addVoter(uint256 _pollId, uint256 _identityCommitment) external;

  /// @dev Starts a pull and publishes the key to encrypt the votes.
  /// @param _pollId: Id of the poll.
  /// @param _encryptionKey: Key to encrypt poll votes.
  function startPoll(uint256 _pollId, string memory _encryptionKey) external;

  /// @dev Casts an anonymous vote in a poll.
  /// @param _vote: Encrypted vote.
  /// @param _nullifierHash: Nullifier hash.
  /// @param _pollId: Id of the poll.
  /// @param _proof: Private zk-proof parameters.
  function castVote(
    bytes32 _vote,
    uint256 _nullifierHash,
    uint256 _pollId,
    uint256[8] calldata _proof
  ) external;

  /// @dev Ends a poll and publishes the key to decrypt the votes.
  /// @param _pollId: Id of the poll.
  /// @param _decryptionKey: Key to decrypt poll votes.
  function endPoll(uint256 _pollId, string memory _decryptionKey) external;

  /// @dev Return poll coordinator.
  /// @param _pollId: Id of the poll.
  function getCoordinator(uint256 _pollId) external returns(address);

  /// @dev Return poll condidates.
  /// @param _pollId: Id of the poll.
  /// @return candidates: The candidate list of the poll.
  function getCandidates(uint256 _pollId) external returns(address[] memory);

  /// @dev Return poll state.
  /// @param _pollId: Id of the poll.
  function getPollState(uint256 _pollId) external returns(uint8);
}
