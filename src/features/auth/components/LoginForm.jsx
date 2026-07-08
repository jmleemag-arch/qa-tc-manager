import { useState } from "react";
import {
  DEMO_USER_ID,
  DEMO_USER_PASSWORD,
  LOGIN_ERROR_MESSAGE,
} from "../constants/authConstants";

function LoginForm({ onLogin }) {
  const [loginId, setLoginId] = useState("");
  const [loginPw, setLoginPw] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (loginId === DEMO_USER_ID && loginPw === DEMO_USER_PASSWORD) {
      onLogin();
      setLoginError("");
    } else {
      setLoginError(LOGIN_ERROR_MESSAGE);
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
            placeholder={DEMO_USER_ID}
          />
        </label>

        <label>
          비밀번호
          <input
            type="password"
            value={loginPw}
            onChange={(e) => setLoginPw(e.target.value)}
            placeholder={DEMO_USER_PASSWORD}
          />
        </label>

        {loginError && <p className="login-error">{loginError}</p>}

        <button type="submit">로그인</button>
      </form>

      <div className="login-help">
        <span>임시 계정</span>
        <strong>
          {DEMO_USER_ID} / {DEMO_USER_PASSWORD}
        </strong>
      </div>
    </>
  );
}

export default LoginForm;
