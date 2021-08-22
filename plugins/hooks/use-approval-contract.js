import { useContract } from "./use-contract";
import {
  APPROVAL_KEY,
  APPROVAL_ABI,
  APPROVAL_ADDRESS,
} from "../helpers/constants";

export function useApprovalContract() {
  return useContract(APPROVAL_KEY, APPROVAL_ABI, APPROVAL_ADDRESS);
}
