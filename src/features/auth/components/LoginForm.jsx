import { useState } from "react";
import authApi from "../../../services/authApi";
import { LOGIN_ERROR_MESSAGE } from "../constants/authConstants";

function LoginForm({ onLogin }) {
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const response = await authApi.login(loginId.trim(), loginPw);
      const user = response.data;

      if (user?.userId) {
        onLogin(user);
        return;
      }

      setLoginError(LOGIN_ERROR_MESSAGE);
    } catch {
      setLoginError(LOGIN_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="login-form">
        <label>
          아이디
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="tester1"
            disabled={isSubmitting}
          />
        </label>

        <label>
          비밀번호
          <input
            type="password"
            value={loginPw}
            onChange={(e) => setLoginPw(e.target.value)}
            placeholder="test1234"
            disabled={isSubmitting}
          />
        </label>

        {loginError && <p className="login-error">{loginError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "로그인 중..." : "로그인"}
        </button>
      </form>

      <div className="login-help">
        <span>DB에 등록된 계정으로 로그인합니다. (기본 비밀번호: test1234)</span>
      </div>
    </>
  );
}

export default LoginForm;
