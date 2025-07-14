const axios = require("axios");

exports.handler = async (event) => {
  const query = event.queryStringParameters.query || "developer in New York";

  try {
    const response = await axios.get("https://jsearch.p.rapidapi.com/search", {
      params: { query, page: 1, num_pages: 1 },
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY, // ← secret in Netlify settings
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API call failed" })
    };
  }
};