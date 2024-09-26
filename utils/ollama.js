const axios = require('axios'); // Ensure axios is imported

const generateCode = async (prompt) => {
  try {
    // Make a POST request to the Ollama API (adjust URL/port as necessary)
    const response = await axios.post('http://localhost:8080/generate', {
      model: 'codellama:7B',  // Replace with the appropriate model
      prompt
    });

    // Check if the response contains the 'response' field with the generated code
    if (response.data && response.data.response) {
      return response.data.response;  // Return the generated code
    } else {
      console.error('Unexpected response structure:', response.data);
      return '';  // Return an empty string if the structure is not as expected
    }
  } catch (error) {
    // Detailed error handling
    if (error.response) {
      // The server responded with a status code other than 2xx
      console.error('Server responded with error:', error.response.status, error.response.data);
    } else if (error.request) {
      // No response was received from the server
      console.error('No response received:', error.request);
    } else {
      // Error occurred during setup
      console.error('Error setting up the request:', error.message);
    }
    
    return '';  // Return an empty string if there's an error
  }
};

// Example usage:
(async () => {
  const prompt = 'Write a Python function to calculate the factorial of a number.';
  const code = await generateCode(prompt);
  console.log('Generated Code:\n', code);
})();
