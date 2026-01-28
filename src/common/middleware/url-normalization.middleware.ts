import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class UrlNormalizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Normalize double slashes in the URL path
    const originalUrl = req.url;
    if (originalUrl.includes('//')) {
      const normalizedUrl = originalUrl.replace(/\/+/g, '/');
      req.url = normalizedUrl;
      console.log(`URL normalized: ${originalUrl} -> ${normalizedUrl}`);
    }
    next();
  }
}
