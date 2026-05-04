// src/components/Button/Button.jsx
import { StyledButton } from './Button.styles'

export default function Button({ variant = 'primary', ...props }) {
  return <StyledButton $variant={variant} {...props} />
}
