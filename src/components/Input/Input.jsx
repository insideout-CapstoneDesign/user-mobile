import {
  ErrorText,
  InputContainer,
  Label,
  StyledInput,
} from './Input.styles'

export default function Input({
  label,
  subLabel,
  id,
  type = 'text',
  error = false,
  errorMessage = '',
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

      <StyledInput id={id} type={type} aria-invalid={error || undefined} {...props} />
      <ErrorText aria-live="polite">{errorMessage || '\u00A0'}</ErrorText>
    </InputContainer>
  )
}
