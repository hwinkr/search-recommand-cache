import React, { useMemo, useRef, useState } from 'react';
import useDebounceSearch from '../../hooks/useDebounceSearch';
import styled from 'styled-components';
import KeyWordCache from '../../apis/cache';
import CACHE_KEY from '../../constants/cache-key';
import RecentKeyword from '../../components/RecentKeyword';
import Icon from '../../components/Icon';
import isEmpty from '../../utils/is-empty';
import movetoResultPage from '../../utils/move-to-page';
import KEYBOARD_EVENT from '../../constants/keyboard-event';

const cache = new KeyWordCache(CACHE_KEY, 1000 * 60 * 60, sessionStorage);

const Home = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [isAutoSearch, setIsAutoSearch] = useState<boolean>(false);
  const recommandList = useDebounceSearch(keyword, 300, cache, isAutoSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentKeywords = useMemo(() => cache.getRecentKeywords(), []);

  const recommendElements: HTMLLIElement[] = [];
  const setRecommendElements = (element: HTMLLIElement) => {
    if (!element) return;
    recommendElements.push(element);
  };

  const clearKeyword = () => {
    setKeyword('');
  };
  const handleChangeKeyword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };
  const selectSearchKeyword = (): string => {
    if (!inputRef.current?.value) return '';
    return isAutoSearch ? inputRef.current?.value : keyword;
  };
  const handleKeywordSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault();
    const selectedKeyword = selectSearchKeyword();
    movetoResultPage(selectedKeyword);
    cache.set(selectedKeyword);
  };

  const handleInputKeyboardEvent = (e: React.KeyboardEvent) => {
    if (isEmpty(recommendElements)) return;
    switch (e.key) {
      case KEYBOARD_EVENT.DOWN:
        if (e.nativeEvent.isComposing) return;
        e.preventDefault();
        recommendElements[0].focus();
        if (inputRef.current) inputRef.current.value = recommendElements[0].innerText;
        setIsAutoSearch(true);
        break;
      case KEYBOARD_EVENT.ESACPE:
        clearKeyword();
        isAutoSearch && setIsAutoSearch(false);
        break;
      default:
        return;
    }
  };

  const handleItemKeyboardEvent = (e: React.KeyboardEvent<HTMLLIElement>, index: number) => {
    switch (e.key) {
      case KEYBOARD_EVENT.DOWN:
        e.preventDefault();
        if (index !== recommendElements.length - 1) {
          recommendElements[index + 1].focus();
          if (inputRef.current) inputRef.current.value = recommendElements[index + 1].innerText;
          return;
        }
        recommendElements[0].focus();
        if (inputRef.current) inputRef.current.value = recommendElements[0].innerText;
        break;
      case KEYBOARD_EVENT.UP:
        if (index !== 0) {
          recommendElements[index - 1].focus();
          if (inputRef.current) inputRef.current.value = recommendElements[index - 1].innerText;
          return;
        }
        setIsAutoSearch(prev => !prev);
        inputRef.current?.focus();
        break;
      case KEYBOARD_EVENT.ESACPE:
        clearKeyword();
        isAutoSearch && setIsAutoSearch(false);
        break;
      default:
        inputRef?.current?.value && setKeyword(inputRef.current.value);
        inputRef.current?.focus();
        setIsAutoSearch(false);
        return;
    }
  };

  return (
    <Container>
      <Title>
        국내 모든 임상시험 검색하고 <br /> 온라인으로 참여하기
      </Title>
      <StyledForm onSubmit={handleKeywordSubmit}>
        <StyledInput
          placeholder="질환명을 입력해주세요"
          value={isAutoSearch ? inputRef.current?.value : keyword}
          ref={inputRef}
          onChange={handleChangeKeyword}
          onKeyDown={handleInputKeyboardEvent}
        />
        <IconContainer>
          {!isEmpty(keyword) && <Icon kind="cancel" size="24" onClick={clearKeyword} />}
          <Icon kind="search" size="36" color="#017be8" />
        </IconContainer>
      </StyledForm>
      <SearchContainer>
        {recommandList.length > 0 ? (
          <>
            <span>추천 검색어</span>
            <RecommandList>
              {recommandList.map((recommandItem, index) => (
                <RecommandItem
                  key={recommandItem.sickCd}
                  ref={element => element && setRecommendElements(element)}
                  tabIndex={index}
                  onKeyDown={event => handleItemKeyboardEvent(event, index)}
                >
                  <Icon kind="search" color="EAEAEF" size="24" />
                  {recommandItem.sickNm}
                </RecommandItem>
              ))}
            </RecommandList>
          </>
        ) : (
          <RecentKeyword recentKeywords={recentKeywords} moveToResultPage={movetoResultPage} />
        )}
      </SearchContainer>
    </Container>
  );
};

export default Home;

const Container = styled.main`
  height: 100vh;
  width: 100%;

  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  background-color: #cae9ff;
  position: relative;
`;

const Title = styled.span`
  font-size: 32px;
  font-weight: bold;
  line-height: 1.5;
  text-align: center;
`;

const StyledForm = styled.form`
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  margin-bottom: 10px;
  position: relative;
`;

const StyledInput = styled.input`
  height: 2em;
  width: 100%;
  padding: 10px;
  border-radius: 30px;
  text-indent: 10px;
  font-size: 18px;

  margin-top: 12px;
  outline: none;
  border: none;

  &:focus {
    outline: 2px solid blue;
  }
`;

const IconContainer = styled.div`
  position: absolute;
  right: 0;
  top: 55%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SearchContainer = styled.div`
  width: 50%;
  display: flex;
  padding: 10px;

  font-size: 18px;
  font-weight: light;
  text-indent: 10px;
  line-height: 1.8;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  background-color: white;
  border-radius: 15px;
  position: static;
`;

const RecommandList = styled.ul`
  width: 100%;
  max-height: 300px;
  overflow-y: scroll;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const RecommandItem = styled.li`
  margin-left: 10px;
  padding: 3px;
  background-color: white;
  &:focus {
    background-color: #017be9;
  }
  border-radius: 15px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #017be9;
  }
  cursor: pointer;
`;
