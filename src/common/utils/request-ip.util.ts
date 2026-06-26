import { Request } from 'express';

export function getRequestIp(request: Request) {
  const forwardedFor = request.headers['x-forwarded-for'];
  const realIp = request.headers['x-real-ip'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || undefined;
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0]?.split(',')[0]?.trim() || undefined;
  }

  if (typeof realIp === 'string') {
    return realIp.trim() || undefined;
  }

  if (Array.isArray(realIp) && realIp.length > 0) {
    return realIp[0]?.trim() || undefined;
  }

  return request.ip;
}
