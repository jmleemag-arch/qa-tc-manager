import { APP_SIDEBAR_MENUS } from "../../constants/appConstants";

function Sidebar({ loginUser, activeMenu, onMenuChange }) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-top">
        <div className="app-logo">
          <span className="app-logo-mark">QA</span>
          <div>
            <strong>QA Manager</strong>
            <span>테스트 관리 도구</span>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {APP_SIDEBAR_MENUS.map((menu) => (
            <button
              key={menu}
              type="button"
              className={
                menu === activeMenu ? "app-nav-item active" : "app-nav-item"
              }
              onClick={() => onMenuChange(menu)}
            >
              {menu}
            </button>
          ))}
        </nav>
      </div>

      <div className="app-sidebar-user">
        <div className="app-user-avatar">
          {loginUser.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <strong>QA Tester</strong>
          <span>{loginUser}</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
