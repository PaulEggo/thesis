//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/// @title AnonymousVotingConsensus interface.
/// @dev Interface of AnonymousVotingConsensus contract.
interface IAnonymousVotingConsensus {

    struct candidate_management_header {
        address miner; // Address of candidate.
        int nonce; // Join(1) or Withdraw(-1).
        uint256[10] extra_data; // Not used.
    }

    struct member_management_header {
        address miner; // Not used.      
        int nonce; // Join(1).
        uint256[10] extra_data; // extra_data[0] contains the commitement of the member.
    }

    struct cast_vote_header {
        address miner; // Not used.      
        int nonce; // Not used.
        uint256[10] extra_data; // extra_data[0] contains the Nullifier Hash, extra_data[1] contains the vote, 
                                // extra_data[1-7] contains the proof.
    }

    struct key_anouncement_header {
        address miner; // Not used.      
        int nonce; // Encryption(-1) or Decryption(2).
        uint256[10] extra_data; // extra_data[0] contains the encryption/decryption key.   
    }
}