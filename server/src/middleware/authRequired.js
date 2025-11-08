import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be defined to verify authentication tokens.');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Protect routes by requiring a valid Bearer token and exposing the decoded subject.
export function authRequired(req, res, next) {
  const header = req.get('authorization');

  if (!header || !header.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({
      error: {
        code: 'auth_required',
        message: 'Authorization header with Bearer token is required.',
      },
    });
  }

  const token = header.slice(7).trim();

  try {
    const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });

    if (!payload.sub) {
      return res.status(401).json({
        error: {
          code: 'invalid_token',
          message: 'Token subject is missing.',
        },
      });
    }

    // Expose the verified user id on the request for downstream handlers.
    req.auth = {
      userId: payload.sub,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: 'invalid_token',
        message: 'Token is invalid or expired.',
      },
    });
  }
}
