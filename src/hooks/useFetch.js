import { useState, useEffect } from "react";

export const useFetch = (url, method = "GET") => {
  // Define state variables for data, pending status, error, and options
  const [data, setData] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);
  const [options, setOptions] = useState(null);

  // Define a helper function to set options for a POST request
  const postData = (postData) => {
    setOptions({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });
  };

  // Use useEffect to perform the fetch request and update state variables
  useEffect(() => {
    // Create a new AbortController instance
    const controller = new AbortController();

    // Define an async function to fetch data
    const fetchData = async (fetchOptions) => {
      setIsPending(true);

      try {
        // Perform the fetch request with the given URL and options, including the signal from the AbortController
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        // If the response is not OK, throw an error
        if (!res.ok) {
          throw new Error(res.statusText);
        }

        // Parse the response body as JSON and update state variables
        const data = await res.json();
        setIsPending(false);
        setData(data);
        setError(null);
      } catch (err) {
        // If the fetch was aborted, log a message to the console
        if (err.name === "AbortError") {
          console.log("the fetch was aborted");
        } else {
          // Otherwise, update the error state variable
          setIsPending(false);
          setError("Could not fetch the data");
        }
      }
    };

    // If the method is GET, call the fetchData function with no options
    if (method === "GET") {
      fetchData();
    }
    // If the method is POST and options are provided, call the fetchData function with the options
    if (method === "POST" && options) {
      fetchData(options);
    }

    // Return a cleanup function that aborts the fetch request (cancel any outstanding requests)
    return () => {
      controller.abort();
    };
  }, [url, options, method]);

  // Return the state variables and the postData function as an object
  return { data, isPending, error, postData };
};
