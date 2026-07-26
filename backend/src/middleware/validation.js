// Error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: true,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Request validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // TODO: Implement request validation using schema
    next();
  };
};
