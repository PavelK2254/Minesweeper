/// <reference lib="webworker" />

addEventListener('message', ({ data }) => {
  console.log("Worker message: " + data)
  const response = `worker response to ${data}`;
  postMessage(response);
});
