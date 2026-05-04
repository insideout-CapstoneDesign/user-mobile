// src/components/Input/Input.jsx
import 'react'
import * as S from './Input.styles'

export default function Input({ 
  label, 
  subLabel, 
  ...props 
}) {
  return (
    <S.InputContainer>
      {label && (
        <S.Label>
          {label}
          {subLabel && <span>({subLabel})</span>}
        </S.Label>
      )}
      <S.StyledInput {...props} />
    </S.InputContainer>
  )
}