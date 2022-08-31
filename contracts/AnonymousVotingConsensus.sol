//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./interfaces/IAnonymousVotingConsensus.sol";

contract AnonymousVotingConsensus is IAnonymousVotingConsensus {
    candidate_management_header[] public candidateHeaderList;
    member_management_header[] public    memberHeaderList;
    cast_vote_header[] public            voteHeaderList;
    key_anouncement_header[] public      keyHeaderList;

    function enrollCandidate(address _candidate) public {
        require(_candidate == msg.sender, "AnonymousVotingConsensus: Caller is not the referred candidate");

        candidate_management_header memory new_header;
        uint256[10] memory extraData;

        new_header.miner = _candidate;
        new_header.nonce = 0;

        for(uint8 i=0 ; i<10 ; i++) {
            extraData[i] = 0;
        }
        new_header.extra_data = extraData;

        candidateHeaderList.push(new_header);
    }

    function withdrawCandidate(address _candidate) public {
        require(_candidate == msg.sender, "AnonymousVotingConsensus: Caller is not the referred candidate");

        candidate_management_header memory new_header;
        uint256[10] memory extraData;

        new_header.miner = _candidate;
        new_header.nonce = -1;

        for(uint8 i=0 ; i<10 ; i++) {
            extraData[i] = 0;
        }
        new_header.extra_data = extraData;

        candidateHeaderList.push(new_header);
    }

    function addMember(uint256 _commitment) public {
        member_management_header memory new_header;
        uint256[10] memory extraData;

        new_header.miner = address(0);
        new_header.nonce = 1;

        extraData[0] = _commitment;
        for(uint8 i=1 ; i<10 ; i++) {
            extraData[i] = 0;
        }

        memberHeaderList.push(new_header);
    }

    function castVote(bytes32 _vote, uint256 _nullifierHash, uint256[8] calldata _proof) public {
        cast_vote_header memory new_header;
        uint256[10] memory extraData;

        new_header.miner = address(0);
        new_header.nonce = 0;

        extraData[0] = _nullifierHash;
        extraData[1] = uint256(_vote);
        for(uint8 i=2 ; i<10 ; i++) {
            extraData[i] = _proof[i-2];
        }

        new_header.extra_data = extraData;

        voteHeaderList.push(new_header);
    }

    function anounceEncryptionKey(uint256 _encryptionKey) public {
        key_anouncement_header memory new_header;
        uint256[10] memory extraData;   

        new_header.miner = address(0);
        new_header.nonce = -1;

        extraData[0] = _encryptionKey;
        for(uint8 i=1 ; i<10 ; i++) {
            extraData[i] = 0;
        }
        new_header.extra_data = extraData;

        keyHeaderList.push(new_header);
    }

    function anounceDecryptionKey(uint256 _decryptionKey) public {
        key_anouncement_header memory new_header;
        uint256[10] memory extraData;   

        new_header.miner = address(0);
        new_header.nonce = 2;

        extraData[0] = _decryptionKey;
        for(uint8 i=1 ; i<10 ; i++) {
            extraData[i] = 0;
        }
        new_header.extra_data = extraData;

        keyHeaderList.push(new_header);
    }

    /*function readCurrentBlock() public {
        blockhash(1);
    }*/

    function clearLists() public {
        delete candidateHeaderList;
        delete memberHeaderList;
        delete voteHeaderList;
        delete keyHeaderList;
    }
}