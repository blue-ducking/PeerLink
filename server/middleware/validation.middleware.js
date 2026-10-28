/**
 * Simple, robust validation middlewares for core PeerLink operations.
 */

function validateRegister(req, res, next) {
  const { university_id, password, name } = req.body;

  if (!university_id || typeof university_id !== 'string' || university_id.trim().length < 3) {
    return res.status(400).json({
      success: false,
      error: 'University ID must be a valid string of at least 3 characters.'
    });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 6 characters long.'
    });
  }

  // Sanitize fields
  req.body.university_id = university_id.trim().toUpperCase();
  req.body.name = name && typeof name === 'string' && name.trim() ? name.trim() : `Student ${req.body.university_id}`;
  next();
}

function validateLogin(req, res, next) {
  const { university_id, password } = req.body;

  if (!university_id || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both University ID and Password.'
    });
  }

  req.body.university_id = String(university_id).trim().toUpperCase();
  next();
}

function validateListing(req, res, next) {
  const { title, description, category_id } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length < 5) {
    return res.status(400).json({
      success: false,
      error: 'Title is required and must be at least 5 characters.'
    });
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Description is required and must be at least 10 characters.'
    });
  }

  if (!category_id || isNaN(Number(category_id))) {
    return res.status(400).json({
      success: false,
      error: 'A valid category must be selected.'
    });
  }

  next();
}

function validateRequest(req, res, next) {
  const { listing_id, message } = req.body;

  if (!listing_id || isNaN(Number(listing_id))) {
    return res.status(400).json({
      success: false,
      error: 'A valid listing ID must be specified.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a message of at least 10 characters explaining what you need.'
    });
  }

  next();
}

module.exports = {
  validateRegister,
  validateLogin,
  validateListing,
  validateRequest
};
