import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import { signupSchema } from '../../schemas/auth.schema'
import './SignupPage.css'

export default function SignupPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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

  const onSubmit = () => {
    // TODO: 회원가입 API 연동
  }

  return (
    <main className="auth-page">
      <header className="auth-page__header">
        <img className="auth-page__logo-mark" src="/logo3.svg" alt="insideout" />
        <p className="auth-page__description">새 계정을 만들어보세요.</p>
      </header>

      <form className="auth-page__form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          id="signup-name"
          label="이름"
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
          placeholder="8자 이상 입력해 주세요"
          error={!!errors.password}
          errorMessage={errors.password?.message}
          {...register('password')}
        />
        <Input
          id="signup-confirm-password"
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력해 주세요"
          error={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="auth-page__submit">
          <Button type="submit" disabled={!isValid}>
            회원가입
          </Button>
        </div>
      </form>

      <p className="auth-page__link">
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </p>
    </main>
  )
}
