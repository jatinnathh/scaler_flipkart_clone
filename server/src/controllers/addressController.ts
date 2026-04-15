import { Request, Response, NextFunction } from 'express';
import * as addressQueries from '../queries/addresses.js';

export async function getAddresses(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const addresses = await addressQueries.getAddresses(user.id);
    res.json({ success: true, data: addresses });
  } catch (error) {
    next(error);
  }
}

export async function createAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { full_name, phone, address_line1, address_line2, city, state, pincode, landmark, address_type, is_default } = req.body;

    if (!full_name || !phone || !address_line1 || !city || !state || !pincode) {
      return res.status(400).json({ success: false, error: 'Missing required address fields' });
    }

    const address = await addressQueries.createAddress(user.id, {
      full_name, phone, address_line1, address_line2, city, state, pincode, landmark, address_type, is_default,
    });

    res.status(201).json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function updateAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;
    
    const address = await addressQueries.updateAddress(parseInt(id), user.id, req.body);
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    const user = (req as any).dbUser;
    const { id } = req.params;

    const address = await addressQueries.deleteAddress(parseInt(id), user.id);
    if (!address) {
      return res.status(404).json({ success: false, error: 'Address not found' });
    }

    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    next(error);
  }
}
