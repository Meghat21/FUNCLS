const getFullUrl = (req) => {
  const protocol = req.protocol;
  const host = req.hostname;
  // const url = req.originalUrl;
  // const port = process.env.PORT || 5000;
  const port = 3001;

  const fullUrl = `${protocol}://${host}:${port}`;
  return fullUrl;
};

module.exports = { getFullUrl };
