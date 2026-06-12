import { useNavigate } from 'react-router-dom'
import CommonHeader from '../../components/CommonHeader/CommonHeader'
import SearchAutocompleteList from '../../components/Search/SearchAutocompleteList'
import SearchResultList from '../../components/Search/SearchResultList'
import useSearchPageController from './useSearchPageController'
import './SearchPage.css'

export default function SearchPage() {
  const navigate = useNavigate()
  const {
    keyword,
    isResultMode,
    isLoading,
    hasSearchError,
    searchStateMessage,
    recentKeywords,
    autocompleteItems,
    resultItems,
    handleChangeKeyword,
    handleSelectAutocomplete,
    handleRemoveRecentKeyword,
    handleClearRecentKeywords,
    handleSelectRecentKeyword,
    handleSelectResult,
    runSearch,
  } = useSearchPageController()

  return (
    <main className="search-page">
      <CommonHeader
        variant="search"
        onBack={() => navigate(-1)}
        searchProps={{
          value: keyword,
          onChange: handleChangeKeyword,
          onSearch: runSearch,
          placeholder: '건물, 장소 검색',
          ariaLabel: '건물 및 장소 검색',
          autoFocus: true,
        }}
      />

      <section className="search-page__content">
        {!isResultMode ? (
          <SearchAutocompleteList
            recentKeywords={recentKeywords}
            items={autocompleteItems}
            onSelect={handleSelectAutocomplete}
            onRemoveRecentKeyword={handleRemoveRecentKeyword}
            onClearRecentKeywords={handleClearRecentKeywords}
            onSelectRecentKeyword={handleSelectRecentKeyword}
          />
        ) : null}

        {isResultMode && isLoading ? (
          <p className="search-page__state">검색 중</p>
        ) : null}

        {isResultMode && !isLoading && resultItems.length > 0 ? (
          <SearchResultList items={resultItems} onSelect={handleSelectResult} />
        ) : null}

        {isResultMode && !isLoading && resultItems.length === 0 ? (
          <p className="search-page__state">
            {hasSearchError
              ? searchStateMessage || '검색 결과를 불러오지 못했습니다.'
              : '검색 결과가 없습니다.'}
          </p>
        ) : null}
      </section>
    </main>
  )
}
