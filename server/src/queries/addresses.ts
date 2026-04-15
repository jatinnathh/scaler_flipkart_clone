import { query } from '../config/db.js';

export async function getAddresses(userId: string) {
  return query(
    `SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC`,
    [userId]
  );
}

export async function getAddressById(addressId: number, userId: string) {
  const result = await query(
    `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
    [addressId, userId]
  );
  return result[0] || null;
}

export async function createAddress(userId: string, data: {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  address_type?: string;
  is_default?: boolean;
}) {
  // If setting as default, unset other defaults first
  if (data.is_default) {
    await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
  }

  const result = await query(
    `INSERT INTO addresses (user_id, full_name, phone, address_line1, address_line2, city, state, pincode, landmark, address_type, is_default)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      userId, data.full_name, data.phone, data.address_line1,
      data.address_line2 || null, data.city, data.state, data.pincode,
      data.landmark || null, data.address_type || 'home', data.is_default || false
    ]
  );
  return result[0];
}

export async function updateAddress(addressId: number, userId: string, data: Partial<{
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  address_type: string;
  is_default: boolean;
}>) {
  if (data.is_default) {
    await query(`UPDATE addresses SET is_default = false WHERE user_id = $1`, [userId]);
  }

  const fields = Object.keys(data);
  const values = Object.values(data);
  const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');

  const result = await query(
    `UPDATE addresses SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`,
    [addressId, userId, ...values]
  );
  return result[0] || null;
}

export async function deleteAddress(addressId: number, userId: string) {
  const result = await query(
    `DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *`,
    [addressId, userId]
  );
  return result[0] || null;
}
