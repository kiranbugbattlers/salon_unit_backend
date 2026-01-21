import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();
    const { method, originalUrl } = req;

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusCode = res.statusCode;
      
      // Color codes
      const reset = '\x1b[0m';
      const bold = '\x1b[1m';
      const dim = '\x1b[2m';
      
      // Status colors
      const green = '\x1b[32m';
      const red = '\x1b[31m';
      const yellow = '\x1b[33m';
      const cyan = '\x1b[36m';
      const white = '\x1b[37m';
      const bgGreen = '\x1b[42m';
      const bgRed = '\x1b[41m';
      const bgYellow = '\x1b[43m';
      const black = '\x1b[30m';
      
      // Determine colors based on status
      let statusBg = bgGreen;
      let statusText = black;
      let lineColor = green;
      let statusIcon = '✓';
      
      if (statusCode >= 400 && statusCode < 500) {
        statusBg = bgYellow;
        statusText = black;
        lineColor = yellow;
        statusIcon = '⚠';
      } else if (statusCode >= 500) {
        statusBg = bgRed;
        statusText = white;
        lineColor = red;
        statusIcon = '✗';
      }
      
      // Method colors and formatting
      let methodColor = cyan;
      let methodIcon = '→';
      if (method === 'POST') {
        methodColor = green;
        methodIcon = '+';
      } else if (method === 'PUT' || method === 'PATCH') {
        methodColor = yellow;
        methodIcon = '~';
      } else if (method === 'DELETE') {
        methodColor = red;
        methodIcon = '-';
      }
      
      // Timestamp
      const timestamp = new Date().toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      // Format the log line - entire line colored based on status
      console.log(
        `${lineColor}${dim}${timestamp}${reset} ` +
        `${lineColor}${methodIcon} ${bold}${method.padEnd(7)}${reset} ` +
        `${lineColor}${originalUrl}${reset} ` +
        `${statusBg}${statusText}${bold} ${statusCode} ${reset} ` +
        `${dim}${duration}ms${reset}`
      );
    });

    next();
  }
}
