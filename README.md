# 검색어 자동완성 추천과 캐싱 기능 구현

## 요구 사항

- [x] [한국임상정보](https://clinicaltrialskorea.com/)의 검색창을 클론한다.
- [x] 질환명 검색시 API 호출을 통해서 검색어 추천 기능을 구현한다. 검색어가 없을 시 "검색어 없음"을 표출한다.
- [x] API 호출 별로 로컬 캐싱을 구현한다.
- [x] 입력마다 API 호출 하지 않도록 API 호출 횟수를 줄이는 전략 수립 및 실행
- [x] 키보드만으로 추천 검색어들로 이동 가능 하도록 구현

```text
1. 캐싱 기능을 제공하는 라이브러리 사용 금지(React-Query 등)
2. 캐싱을 어떻게 기술했는지에 대한 내용 README에 기술
3. expire time을 구현할 경우 가산점
```

## Debounce 패턴 적용하기

> Debounce는 여러번 발생하는 이벤트에서, 가장 마지막 이벤트 만을 실행 되도록 만드는 개념이다.

### 문제

```ts
useEffect(() => {
  const getRecommandList = async () => {
    if (isEmptyKeyword()) return;
    console.info('calling api');
    try {
      const recommandList = await http.get(`/sick?q=${keyword}`);
      setRecommandList(recommandList);
    } catch (error) {
      return error;
    }
  };
}, [keyword]);
```

```html
<input value="{keyword}" onChange="{e" ="" /> setKeyword(e.target.value)} />
```

useEffect 훅의 의존성 배열에 있는 `keyword`가 변경될 때 마다, api를 호출해서 추천 검색어 목록을 가져오는 코드이다.

사용자가 입력하는 검색 키워드가 변경될 때 마다, `setKeyword` 함수가 호출되어 검색 키워드가 변경될 때 마다 api 호출도 발생한다.
이는 **api 호출을 너무 많이 하게 되는 문제가 발생한다**.  
예를 들어, `담낭` 키워드를 입력하는 순서는 `ㄷ -> ㅏ > ㅁ -> ㄴ -> ㅏ -> ㅇ` 이고 총 6번의 상태 변경이 발생한다.  
따라서 api 호출이 6번 발생하고 이는 사용자가 검색하려는 키워드가 길어질수록 서버가 감당해야 할 부하가 점점 더 심해지는 문제를 발생시킨다.

### 해결

> 브라우저 API 중 하나인 setTimeout(callback, delayTime)은 delayTime 만큼 시간이 지난 후 `callback` 함수를 실행 시킨다.
> clearTimeout(setTimeout)은 setTimeout 호출 로 인해 생성된 타임아웃을 취소한다.

이 특징을 사용해, 검색에 `Debounce` 패턴을 적용했다.

```ts
useEffect(() => {
  const getRecommandList = async () => {
    if (isEmptyKeyword()) return;
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
}, [keyword]);
```

```html
<input value="{keyword}" onChange="{e" ="" /> setKeyword(e.target.value)} />
```

사용자가 검색하려는 키워드는 `상태`로 다뤄져야 하므로 `useState`를 사용하는 것은 동일하다.

```ts
return () => {
  clearTimeout(searchTimerID);
};
```

`useEffect(effect, [])`  
useEffect 훅의 `cleanup function`은 다음 effect 함수가 실행 되기 전 실행되는 함수이므로, 이를 이용해 keyword가 계속해서 변하고 이로 인해 effect 함수가 다시 실행되는 경우, 실행 되기 전 `cleartTimeout` 함수 호출을 통해서 예정되어 있던 타임아웃을 취소하고 새로운 키워드에 대한 타임아웃을 다시 생성하도록 했다.
추가로, 키보드 이동 이벤트로 인한 자동완성 기능을 사용 중인 경우(isAutoSearch)에는 API 호출을 하지 않도록 했다.

## API 호출 별로 로컬 캐싱 구현하기

> API 호출별로 `검색 키워드 - 추천 검색어`를 키-쌍 구조의 객체로 **세션 스토리지**에 로컬 캐싱 했다. 세션 스토리지를 사용한 이유는, 클론해야하는 사이트인 [한국임상정보](https://clinicaltrialskorea.com/)가 `검색 키워드`를 세션 스토리지에 로컬 캐싱 하고 있기도 했고 한번도 사용해보지 않은 브라우저 스토리지라 이번 기회에 사용해보고 싶었다. 하지만, 구현을 위해서 실제로 사용해보고 브라우저 스토리지에 대한 글을 읽다보니 로컬과 세션 스토리지는 용량제한(5MB)가 있고 **동기적으로 동작**해서 자바스크립트의 메인 스레드 동작을 방해하는 문제가 있다는 것을 알게 되었다. 이러한 문제점으로 인해서, 앞으로는 `Tansack-Query`를 사용해서 브라우저 메모리를 사용한 캐싱기능을 사용하거나 비동기로 동작하고 용량 제한이 상대적으로 덜한 `Cache-Storage`를 사용해야 할 것 같다.

### 구현 방법

```ts
constructor(cacheKey: string, expireTime: number, storage: Storage) {
    this.CACHE_KEY = cacheKey;
    this.EXPIRE_TIME = expireTime;
    this.storage = storage;
}
```

캐싱은 클래스로 구현했고, 생성자 함수에 `cacheKey`, `expireTime`(만료 시간), `storage`(사용할 스토리지)를 주입 받도록 했다.

- 최근 검색 `키워드`
  - 최근 검색한 키워드만 보여줄 수 있도록 하는 함수를 구현했다
  - 이 함수를 사용해서 사용자는 최근에 검색한 키워드들을 확인할 수 있다.

```ts
getRecentKeywords(){
  //...
}
```

- get()
  - 추천 검색어 리스트를 얻기 위한 api 호출을 하기 전, 캐싱 되어 있는지 확인하기 위한 get 함수를 구현했다.
  - 이 함수가 null을 반환하면 캐싱 되어 있는 데이터가 없다는 것이므로, api 요청을 하게 된다.

```ts
get(){
  // ...
}
```

- set()
  - 사용자가 검색어를 결정하고, `submit`을 하면, cache에 사용자가 검색한 키워드와 그 키워드에 대한 추천 검색어 리스트를 세션 스토리지에 캐싱한다.

## 키보드만으로 추천 검색어들로 이동할 수 있도록 구현.

> 사용자가 키보드 이동을 하게되면, 추천 검색어들이 focusing 되면서 동시에 input의 value가 추천 검색어들로 변경되면 좋을 것 같다고 생각했다.  
> 이를 구현하기 위해서 추천 검색어 자동완성 기능을 사용하고 있는지 아닌지(boolean)를 상태로 관리했다.

### input Element의 키보드 이벤트

```ts
const handleInputKeyboardEvent = (e: React.KeyboardEvent) => {
  if (isEmpty(recommendElements)) return;
  switch (
    e.key
    //...
  ) {
  }
};
```

- 키보드에 DOWN 이벤트가 발생하면 추천 검색어의 첫번째 요소에 focus를 해주고, 자동완성 기능을 사용하기 시작한 것이므로 상태를 변경해준다.
- ESCAPE 이벤트가 발생하면, 검색 키워드를 모두 지워주고 자동완성 기능도 사용하지 않는 것이므로 상태를 변경해준다.

### 추천 검색어 Element의 키보드 이벤트

```ts
const handleItemKeyboardEvent = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
  switch (e.key) {
    //...
    default:
      inputRef?.current?.value && setKeyword(inputRef.current.value);
      inputRef.current?.focus();
      setIsAutoSearch(false);
      return;
  }
};
```

- 키보드에 UP, DOWN, ESCAPE가 발생하면 그에 대한 처리를 해준다.
- 자동완성 기능을 사용 하면서 UP, DOWN, ESCAPE가 아닌 일반적인 키보드 입력의 경우 다시 사용자의 입력을 바로 input value에 반영할 수 있도록 해줘야 하기 때문에 자동완성 기능을 false로 해주고 input value의 상태도 이에 맞춰 변경해준다.
