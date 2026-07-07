import {
  collection,
  doc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query as fsQuery,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Platform, QueryType, SearchHistoryEntry } from '@/types';

const COLLECTION = 'searchHistory';
const HISTORY_LIMIT = 50;

function buildKey(platform: Platform, queryType: QueryType, query: string): string {
  return `${platform}:${queryType}:${query.trim().toLowerCase()}`;
}

// 検索履歴の変更をリアルタイム購読する（新しい順・最大50件）
export function subscribeHistory(onChange: (entries: SearchHistoryEntry[]) => void): () => void {
  const q = fsQuery(collection(db, COLLECTION), orderBy('searchedAt', 'desc'), fsLimit(HISTORY_LIMIT));
  return onSnapshot(q, snapshot => {
    onChange(snapshot.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        platform: data.platform as Platform,
        query: data.query as string,
        queryType: data.queryType as QueryType,
        searchedAt: data.searchedAt as string,
      };
    }));
  });
}

export async function addHistoryEntry(params: { platform: Platform; query: string; queryType: QueryType }): Promise<void> {
  const trimmedQuery = params.query.trim();
  if (!trimmedQuery) return;

  const key = buildKey(params.platform, params.queryType, trimmedQuery);
  // 同一条件（プラットフォーム・検索種別・キーワード）は同じドキュメントIDに書き込む。
  // read→delete→addの非アトミックな重複排除だと同時実行時に二重登録され得るため、
  // キーから導出した固定IDへのsetDocで上書き（=常に単一ドキュメント）にする。
  const docId = encodeURIComponent(key);

  await setDoc(doc(db, COLLECTION, docId), {
    platform: params.platform,
    query: trimmedQuery,
    queryType: params.queryType,
    queryKey: key,
    searchedAt: new Date().toISOString(),
  });

  await trimHistory();
}

async function trimHistory(): Promise<void> {
  const snap = await getDocs(fsQuery(collection(db, COLLECTION), orderBy('searchedAt', 'desc')));
  const excess = snap.docs.slice(HISTORY_LIMIT);
  if (excess.length === 0) return;
  const batch = writeBatch(db);
  excess.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

export async function clearHistory(): Promise<void> {
  const snap = await getDocs(collection(db, COLLECTION));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}
