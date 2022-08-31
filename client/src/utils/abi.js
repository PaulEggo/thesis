export const abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifierAddress",
        type: "address"
      }
    ],
    stateMutability: "nonpayable",
    type: "constructor"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint8",
        name: "depth",
        type: "uint8"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "zeroValue",
        type: "uint256"
      }
    ],
    name: "GroupCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "identityCommitment",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "root",
        type: "uint256"
      }
    ],
    name: "MemberAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "identityCommitment",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "root",
        type: "uint256"
      }
    ],
    name: "MemberRemoved",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "nullifierHash",
        type: "uint256"
      }
    ],
    name: "NullifierHashAdded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_coordinator",
        type: "address"
      }
    ],
    name: "PollCreated",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_coordinator",
        type: "address"
      },
      {
        indexed: false,
        internalType: "string",
        name: "_decryptionKey",
        type: "string"
      }
    ],
    name: "PollEnded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        indexed: true,
        internalType: "address",
        name: "_coordinator",
        type: "address"
      },
      {
        indexed: false,
        internalType: "string",
        name: "_encryptionKey",
        type: "string"
      }
    ],
    name: "PollStarted",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        indexed: false,
        internalType: "bytes32",
        name: "_vote",
        type: "bytes32"
      }
    ],
    name: "VoteAdded",
    type: "event"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_identityCommitment",
        type: "uint256"
      }
    ],
    name: "addVoter",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "_vote",
        type: "bytes32"
      },
      {
        internalType: "uint256",
        name: "_nullifierHash",
        type: "uint256"
      },
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        internalType: "uint256[8]",
        name: "_proof",
        type: "uint256[8]"
      }
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        internalType: "address",
        name: "_coordinator",
        type: "address"
      },
      {
        internalType: "uint8",
        name: "_depth",
        type: "uint8"
      },
      {
        internalType: "address[]",
        name: "_candidateAddresses",
        type: "address[]"
      }
    ],
    name: "createPoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_decryptionKey",
        type: "string"
      }
    ],
    name: "endPoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      }
    ],
    name: "getCandidates",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      }
    ],
    name: "getCoordinator",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    name: "getDepth",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    name: "getNumberOfLeaves",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      }
    ],
    name: "getPollState",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "groupId",
        type: "uint256"
      }
    ],
    name: "getRoot",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_pollId",
        type: "uint256"
      },
      {
        internalType: "string",
        name: "_encryptionKey",
        type: "string"
      }
    ],
    name: "startPoll",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
]
