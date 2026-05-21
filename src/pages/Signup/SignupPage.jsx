import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { signupUser } from '../../apis/authApi'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { signupSchema } from '../../schemas/auth.schema'
import './SignupPage.css'

export default function SignupPage() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values) => {
    setServerError('')

    try {
      await signupUser({
        email: values.email,
        password: values.password,
        displayName: values.name,
      })
      navigate('/login', { replace: true })
    } catch (error) {
      setServerError(error.message)
    }
  }

  return (
    <main className="auth-page">
      <header className="auth-page__header">
        <img className="auth-page__logo-mark" src="/logo3.svg" alt="insideout" />
        <p className="auth-page__description">새 계정을 만들어보세요.</p>
      </header>

      <form
        className="auth-page__form"
        onSubmit={handleSubmit(onSubmit, () => setServerError('입력값을 다시 확인해 주세요.'))}
        noValidate
      >
        <Input
          id="signup-name"
          label="이름"
          maxLength={10}
          placeholder="이름을 입력해 주세요"
          error={!!errors.name}
          errorMessage={errors.name?.message}
          {...register('name')}
        />
        <Input
          id="signup-email"
          label="이메일"
          type="email"
          placeholder="이메일을 입력해 주세요"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="signup-password"
          label="비밀번호"
          type="password"
          maxLength={15}
          placeholder="8자 이상 입력해 주세요"
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="signup-confirm-password"
          label="비밀번호 확인"
          type="password"
          maxLength={15}
          placeholder="비밀번호를 다시 입력해 주세요"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {serverError ? <p className="auth-page__server-error">{serverError}</p> : null}

        <div className="auth-page__submit">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '회원가입'}
          </Button>
        </div>
      </form>

      <p className="auth-page__link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </main>
  )
}
