export const MARKET_ABI = [
  {
    type: "constructor",
    stateMutability: "nonpayable",
    inputs: [
      { type: "address", name: "tokensAddress", internalType: "address" },
      { type: "uint256", name: "date", internalType: "uint256" },
      { type: "uint256", name: "_fee", internalType: "uint256" },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "address", name: "", internalType: "address" }],
    name: "admin",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "payable",
    outputs: [],
    name: "buy",
    inputs: [{ type: "uint256", name: "tokenID", internalType: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "changeFee",
    inputs: [{ type: "uint256", name: "newFee", internalType: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "collectFees",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "uint256", name: "", internalType: "uint256" }],
    name: "endDate",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [{ type: "uint256", name: "", internalType: "uint256" }],
    name: "fee",
    inputs: [],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "list",
    inputs: [
      { type: "uint256", name: "tokenID", internalType: "uint256" },
      { type: "uint256", name: "price", internalType: "uint256" },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    outputs: [
      { type: "address", name: "owner", internalType: "address" },
      { type: "uint256", name: "buyoutPrice", internalType: "uint256" },
    ],
    name: "listings",
    inputs: [{ type: "uint256", name: "", internalType: "uint256" }],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "newRound",
    inputs: [
      { type: "uint256", name: "date", internalType: "uint256" },
      { type: "address", name: "tokens", internalType: "address" },
    ],
  },
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "unlist",
    inputs: [{ type: "uint256", name: "id", internalType: "uint256" }],
  },
];

export const APPROVAL_ABI = [
  {
    type: "function",
    stateMutability: "nonpayable",
    outputs: [],
    name: "setApprovalForAll",
    inputs: [
      { internalType: "address", name: "operator", type: "address" },
      { internalType: "bool", name: "approved", type: "bool" },
    ],
  },
  {
    type: "function",
    stateMutability: "view",
    payable: false,
    outputs: [{ type: "bool", name: "", internalType: "bool" }],
    name: "isApprovedForAll",
    inputs: [
      { type: "address", name: "owner", internalType: "address" },
      { type: "address", name: "operator", internalType: "address" },
    ],
    constant: true,
  },
];
