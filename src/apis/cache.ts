import http from './httpClient';

interface RecommandItem {
  sickCd: string;
  sickNm: string;
}

interface KeywordItem {
  keyword: string;
  expireTime: number;
  recommandList: RecommandItem[];
}

interface Cache {
  get(keyword: string): RecommandItem[] | null;
  set(keyword: string): void;
  getRecentKeywords(): void;
}

class KeyWordCache implements Cache {
  private CACHE_KEY;
  private EXPIRE_TIME;
  private storage;

  constructor(cacheKey: string, expireTime: number, storage: Storage) {
    this.CACHE_KEY = cacheKey;
    this.EXPIRE_TIME = expireTime;
    this.storage = storage;
  }

  private setKeywrodsToStorage(keywrods: KeywordItem[]) {
    this.storage.setItem(this.CACHE_KEY, JSON.stringify(keywrods));
  }

  private getKeywordsFormStorage() {
    return this.storage.getItem(this.CACHE_KEY);
  }

  private getExpireTime() {
    return new Date().getTime() + this.EXPIRE_TIME;
  }

  private isEmptyCache() {
    const cachedKeywords = this.getKeywordsFormStorage();
    return cachedKeywords ? cachedKeywords.length === 0 : true;
  }

  private isExpiredKeyword(expireTime: number) {
    const now = new Date().getTime();
    return now > expireTime;
  }
  getRecentKeywords() {
    const cachedKeywords = this.getKeywordsFormStorage();
    if (this.isEmptyCache() || !cachedKeywords) return null;

    const parseKeywords: KeywordItem[] = JSON.parse(cachedKeywords);
    const keywords: string[] = [];
    for (let i = 0; i < parseKeywords.length; i++) {
      keywords.push(parseKeywords[i].keyword);
    }
    return keywords;
  }
  // interface
  // get : cache에서 최근에 검색한 키워드의 추천 검색어들을 반환해준다.
  // 1. keyword가 없을 경우 : null을 반환
  // 2. 있을 경우 유효시간을 넘었는지 판단하고 넘었을 경우 삭제, 넘지 않을 경우 반환함
  get(keyword: string): RecommandItem[] | null {
    const cachedKeywords = this.getKeywordsFormStorage();
    if (this.isEmptyCache() || !cachedKeywords) return null;

    const parseKeywords: KeywordItem[] = JSON.parse(cachedKeywords);
    for (let i = 0; i < parseKeywords.length; i++) {
      if (parseKeywords[i].keyword !== keyword) continue;
      if (!this.isExpiredKeyword(parseKeywords[i].expireTime))
        return parseKeywords[i].recommandList;
      parseKeywords.splice(i, 1);
      return null;
    }
    return null;
  }
  // interface
  // set : 사용자가 최근에 검색한 키워드를 캐쉬에 추가한다.
  async set(keyword: string): Promise<void> {
    const recommandList = await http.get(`/sick?q=${keyword}`);
    const newItem: KeywordItem = {
      keyword,
      expireTime: this.getExpireTime(),
      recommandList,
    };

    const cachedKeywords = this.getKeywordsFormStorage();
    if (this.isEmptyCache() || !cachedKeywords) {
      this.setKeywrodsToStorage([newItem]);
      return;
    }

    const parseKeyword: KeywordItem[] = JSON.parse(cachedKeywords);
    for (let i = 0; i < parseKeyword.length; i++) {
      if (parseKeyword[i].keyword !== keyword) continue;
      parseKeyword[i].expireTime = this.getExpireTime();
      this.setKeywrodsToStorage(parseKeyword);
      return;
    }
    parseKeyword.push(newItem);
    this.setKeywrodsToStorage(parseKeyword);
  }
}

export default KeyWordCache;
