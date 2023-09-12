import { useEffect, useState } from 'react';
import http from '../apis/httpClient';

interface RecommandItem {
  sickCd: string;
  sickNm: string;
}

interface KeywordItem {
  value: string;
  expireTime: number;
}

interface Cache {
  get(keyword: string): RecommandItem[] | null;
  set(keyword: string): void;
}

const useDebounceSearch = (
  keyword: string,
  DELAY_TIME = 300,
  cache: Cache,
  isAutoSearch: boolean,
) => {
  const [recommandList, setRecommandList] = useState<RecommandItem[] | []>([]);

  const isEmptyKeyword = () => keyword.length === 0;
  useEffect(() => {
    const getRecommandList = async () => {
      if (isAutoSearch) return;

      const cachedRecommandList = cache.get(keyword);
      if (cachedRecommandList) {
        setRecommandList(cachedRecommandList);
        return;
      }
      if (isEmptyKeyword()) {
        setRecommandList([]);
        return;
      }

      console.info('calling api');
      try {
        const recommandList = await http.get(`/sick?q=${keyword}`);
        setRecommandList(recommandList);
      } catch (error) {
        return error;
      }
    };

    const searchTimerID = setTimeout(() => {
      getRecommandList();
    }, DELAY_TIME);

    return () => {
      clearTimeout(searchTimerID);
    };
  }, [keyword, isAutoSearch]);

  return recommandList;
};

export default useDebounceSearch;
