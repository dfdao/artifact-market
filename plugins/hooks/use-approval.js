import { useState, useEffect } from "preact/hooks";
import { useApprovalContract } from "./use-approval-contract";
import { MARKET_ADDRESS } from "../helpers/constants";

export function useApproval() {
  const approvalContract = useApprovalContract();
  const [isApproved, setIsApproved] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  if (error) console.log(error);

  useEffect(() => {
    const isApprovedForAll = approvalContract.data?.contract.isApprovedForAll;
    const setApproved = approvalContract.data?.contract.setApprovalForAll;

    if (
      isApprovedForAll &&
      !isApproved &&
      !loading &&
      !approvalContract.loading
    ) {
      setLoading(true);
      isApprovedForAll(df.account, MARKET_ADDRESS)
        .then((approved) => {
          if (!approved) return setApproved(MARKET_ADDRESS, true);
          return;
        })
        .then(() => {
          setIsApproved(true);
          setLoading(false);
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
        });
    }
  }, [approvalContract.data?.contract]);

  return {
    data: {
      isApproved,
      approvalContract: approvalContract.data,
    },
    loading: loading || approvalContract.loading,
    error: error || approvalContract.error,
  };
}
