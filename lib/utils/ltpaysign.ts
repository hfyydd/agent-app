import { createHash } from 'crypto';

export function wxPaySign(params: Record<string, string | undefined>, key: string | undefined): string {
  const sortedParams = Object.keys(params).sort();
  
  const stringArr = sortedParams.map(paramKey => `${paramKey}=${params[paramKey]}`);
  stringArr.push(`key=${key}`);
  
  const string = stringArr.join('&');
  return createHash('md5').update(string).digest('hex').toUpperCase();
}


