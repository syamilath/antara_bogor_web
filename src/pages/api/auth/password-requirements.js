import { getPasswordRequirements } from '../../../lib/passwordValidation';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const requirements = getPasswordRequirements();
    return res.status(200).json({ requirements });
  } catch (error) {
    console.error('Password requirements API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}