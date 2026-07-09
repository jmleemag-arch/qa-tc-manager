import LoginForm from "../components/LoginForm";

function LoginPage({ onLogin }) {
  return (
    <div className="login-page">
      <div className="login-bg-shape shape-one"></div>
      <div className="login-bg-shape shape-two"></div>

      <div className="login-card">
        <div className="login-logo">QA</div>

        <h1>QA Manager</h1>

        <p className="login-desc">
          QA 테스트케이스와 결함을 관리하는 내부 QA 관리도구입니다.
        </p>

        <LoginForm onLogin={onLogin} />
      </div>
    </div>
  );
}

export default LoginPage;
