// src/components/Input/Input.jsx
import 'react'
import * as S from './Input.styles'

export default function Input({ 
  label, 
  subLabel, 
  id,
  ...props 
}) {
  return (
    <S.InputContainer>
      {label && (
        <S.Label htmlFor={id}>
          {label}
          {subLabel && <span>({subLabel})</span>}
        </S.Label>
      )}
      <S.StyledInput id={id} {...props} />
    </S.InputContainer>
  )
}