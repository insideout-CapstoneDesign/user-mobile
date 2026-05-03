import Button from '../../components/Button/Button'
import './ComponentTestPage.css'

export default function ComponentTestPage() {
  return (
    <main className="component-test-page">
      <h1>insideout</h1>
      <p className="component-test-description">Button 공통 컴포넌트 테스트</p>

      <div className="button-section">
        <Button variant="outline">로그아웃</Button>
      </div>

      <div className="button-section">
        <Button variant="primary">저장</Button>
      </div>

      <div className="button-section">
        <Button disabled>저장 (비활성화)</Button>
      </div>

      <div className="button-row two-col">
        <div className="button-cell">
          <Button variant="outline">출발</Button>
        </div>
        <div className="button-cell">
          <Button variant="primary">도착</Button>
        </div>
      </div>

      <div className="button-row two-col danger-row">
        <div className="button-cell">
          <Button variant="outline">취소</Button>
        </div>
        <div className="button-cell">
          <Button variant="danger">탈퇴하기</Button>
        </div>
      </div>
    </main>
  )
}
