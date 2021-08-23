import { useState, useEffect } from "preact/hooks";
import { useContract } from "./";

export function useApproval() {
  const { approval, marketAddress, ...rest } = useContract();
  const [isApproved, setIsApproved] = useState();
  const [loading, setLoading] = useState();
  const [error, setError] = useState();

  if (error) console.log(error);

  useEffect(() => {
    if (!isApproved && !loading) {
      setLoading(true);
      approval
        .isApprovedForAll(df.account, marketAddress)
        .then((approved) => {
          if (!approved) return approval.setApprovalForAll(marketAddress, true);
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
  }, []);

  return {
    data: {
      isApproved,
    },
    loading,
    error,
  };
}
