function AppLayout({ children }) {
  return (
    <div
      style={{
        width: '375px',
        minHeight: '100dvh',
        margin: '0 auto',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  )
}

export default AppLayout
