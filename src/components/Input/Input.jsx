// src/components/Input/Input.jsx
import 'react'
import { InputContainer, Label, StyledInput } from './Input.styles'

export default function Input({ 
  label, 
  subLabel, 
  id,
  type = "text", // 기본값을 text로 설정
  ...props 
}) {
  return (
    <InputContainer>
      {label && (
        <Label htmlFor={id}>
          {label}
          {subLabel && <span>({subLabel})</span>}
        </Label>
      )}

      <StyledInput id={id} type={type} {...props} />
    </InputContainer>
  )
}