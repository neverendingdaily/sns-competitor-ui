import type { Account, SearchParams } from '@/types';
import { MOCK_ACCOUNTS } from './data';

export function mockSearch(params: SearchParams): Account[] {
  let results = MOCK_ACCOUNTS.filter(a => a.platform === params.platform);

  const q = params.query.trim().toLowerCase();
  if (q) {
    results = results.filter(a => {
      switch (params.queryType) {
        case 'username':
          return a.username.toLowerCase().includes(q) || a.displayName.toLowerCase().includes(q);
        case 'category':
          return a.category.toLowerCase().includes(q);
        case 'hashtag':
        case 'keyword':
          return (
            a.displayName.toLowerCase().includes(q) ||
            a.bio.toLowerCase().includes(q) ||
            a.category.toLowerCase().includes(q) ||
            a.username.toLowerCase().includes(q)
          );
      }
    });
  }

  const f = params.filters;
  if (f.followersMin !== undefined) results = results.filter(a => a.followers >= (f.followersMin ?? 0));
  if (f.followersMax !== undefined) results = results.filter(a => a.followers <= (f.followersMax ?? Infinity));
  if (f.engagementMin !== undefined) results = results.filter(a => a.engagementRate >= (f.engagementMin ?? 0));
  if (f.verifiedOnly) results = results.filter(a => a.isVerified);
  if (f.category) results = results.filter(a => a.category.toLowerCase() === f.category!.toLowerCase());

  if (params.maxResults !== undefined) {
    results = results.slice(0, params.maxResults);
  }

  return results;
}
