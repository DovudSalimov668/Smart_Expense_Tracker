import { useCallback, useEffect, useRef, useState } from "react";

export default function useAsync(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const execute = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fnRef.current();
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    execute().catch(() => {});
    // The caller controls reload semantics with the explicit deps argument.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, ...deps]);

  return { data, setData, loading, error, refetch: execute };
}
