import { IoChevronBack, IoClose, IoMenu } from 'react-icons/io5'
import SearchInput from '../SearchInput/SearchInput'
import {
  FloatingBackButton,
  HeaderCenter,
  HeaderContainer,
  HeaderRight,
  HeaderTitle,
  IconButton,
  RouteInfoCenter,
  RouteInfoText,
} from './CommonHeader.styles'

const HEADER_VARIANTS = ['title', 'search', 'menu', 'routeInfo', 'floatingBack']

export default function CommonHeader({
  variant = 'title',
  title = '',
  onBack,
  onMenuClick,
  onClose,
  origin = '현재 위치',
  destination = '목적지',
  onRouteClick,
  searchProps,
  overlay = false,
  children,
}) {
  const resolvedVariant = HEADER_VARIANTS.includes(variant) ? variant : 'title'

  if (resolvedVariant === 'floatingBack') {
    return (
      <FloatingBackButton type="button" onClick={onBack} aria-label="뒤로가기">
        <IoChevronBack size={24} />
      </FloatingBackButton>
    )
  }

  if (resolvedVariant === 'routeInfo') {
    return (
      <HeaderContainer $variant={resolvedVariant}>
        <IconButton
          type="button"
          $variant={resolvedVariant}
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <IoChevronBack size={24} />
        </IconButton>

        <HeaderCenter $variant={resolvedVariant}>
          <RouteInfoCenter type="button" onClick={onRouteClick}>
            <RouteInfoText>
              {origin} → {destination}
            </RouteInfoText>
          </RouteInfoCenter>
        </HeaderCenter>

        <HeaderRight $hasAction>
          <IconButton
            type="button"
            $variant={resolvedVariant}
            onClick={onClose}
            aria-label="닫기"
          >
            <IoClose size={20} />
          </IconButton>
        </HeaderRight>
      </HeaderContainer>
    )
  }

  return (
    <HeaderContainer $variant={resolvedVariant} $overlay={overlay}>
      <IconButton
        type="button"
        $variant={resolvedVariant}
        onClick={onBack}
        aria-label="뒤로가기"
      >
        <IoChevronBack size={24} />
      </IconButton>

      <HeaderCenter $variant={resolvedVariant}>
        {resolvedVariant === 'search' ? (
          children ?? <SearchInput variant="inline" {...searchProps} />
        ) : (
          <HeaderTitle $variant={resolvedVariant}>{title}</HeaderTitle>
        )}
      </HeaderCenter>

      <HeaderRight $hasAction={resolvedVariant === 'menu'}>
        {resolvedVariant === 'menu' ? (
          <IconButton
            type="button"
            $variant={resolvedVariant}
            onClick={onMenuClick}
            aria-label="메뉴 열기"
          >
            <IoMenu size={20} />
          </IconButton>
        ) : null}
      </HeaderRight>
    </HeaderContainer>
  )
}
