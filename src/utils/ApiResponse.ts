import type { Response } from 'express';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse {
  static ok(res: Response, data: unknown, message = 'Success') {
    return res.status(200).json({ success: true, message, data });
  }

  static created(res: Response, data: unknown, message = 'Created successfully') {
    return res.status(201).json({ success: true, message, data });
  }

  static paginated(res: Response, data: unknown, pagination: Pagination) {
    return res.status(200).json({ success: true, data, pagination });
  }
}
