import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { loginSchema } from '../../schemas/auth.schema'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = (values) => {
    console.log('LOGIN FORM', values)
  }

  return (
    <main className="auth-page login-page">
      <header className="auth-page__header">
        <img className="auth-page__logo" src="/logo2.svg" alt="insideout" />
        <p className="auth-page__description">실내외 통합 길찾기 서비스</p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="login-email"
          type="email"
          placeholder="이메일을 입력해 주세요"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...register('email')}
        />
        <Input
          id="login-password"
          type="password"
          placeholder="비밀번호를 입력해 주세요"
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password')}
        />

        <div className="auth-page__actions">
          <Button type="submit">
            로그인
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/signup')}>
            회원가입
          </Button>
        </div>
      </form>

      <Link className="auth-page__guest-link" to="/map">
        로그인 없이 이용하기
      </Link>
    </main>
  )
}
