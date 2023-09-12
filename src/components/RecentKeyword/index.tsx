import React, { memo } from 'react';
import { styled } from 'styled-components';
import Icon from '../Icon';

interface RecommandItem {
  sickCd: string;
  sickNm: string;
}

interface RecentKeywordProps {
  recentKeywords: string[] | null;
  moveToResultPage: (path: string) => void;
}

const RecentKeyword = ({ recentKeywords, moveToResultPage }: RecentKeywordProps) => {
  return (
    <>
      <Title>최근 검색어</Title>
      {!recentKeywords ? (
        <span>최근 검색어 없음</span>
      ) : (
        <KeywordList>
          {recentKeywords.map((keyword, index) => (
            <KeywordItem key={index} onClick={() => moveToResultPage(keyword)}>
              <Icon kind="search" color="EAEAEF" size="24" />
              {keyword}
            </KeywordItem>
          ))}
        </KeywordList>
      )}
    </>
  );
};

export default RecentKeyword;

const Title = styled.span``;

const KeywordList = styled.ul`
  width: 100%;
  max-height: 300px;
  overflow-y: scroll;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const KeywordItem = styled.li`
  padding: 3px;
  border-radius: 15px;
  margin-left: 10px;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #017be9;
  }
  cursor: pointer;
`;
