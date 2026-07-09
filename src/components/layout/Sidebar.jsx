import { useState } from "react";
import { SIDEBAR_GROUPS } from "../../constants/appConstants";
import { getUserDisplayName } from "../../features/auth/constants/authConstants";

function Sidebar({ loginUser, activeMenu, onMenuChange }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const displayName = getUserDisplayName(loginUser);

  return (
    <aside
      className={
        isCollapsed ? "app-sidebar app-sidebar-collapsed" : "app-sidebar"
      }
    >
      <div className="app-sidebar-top">
        <div className="app-logo">
          <span className="app-logo-mark">QA</span>
          <div className="app-logo-text">
            <strong>QA Manager</strong>
            <span>테스트 관리 도구</span>
          </div>
        </div>

        <nav className="app-sidebar-nav">
          {SIDEBAR_GROUPS.map((group) => (
            <div key={group.label ?? "root"} className="app-nav-group">
              {group.label ? (
                <p className="app-nav-group-label">{group.label}</p>
              ) : null}
              <div className="app-nav-group-items">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={
                      item.id === activeMenu
                        ? "app-nav-item active"
                        : "app-nav-item"
                    }
                    onClick={() => onMenuChange(item.id)}
                    title={item.label}
                  >
                    <span className="app-nav-item-label">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className="app-sidebar-bottom">
        <button
          type="button"
          className="app-sidebar-collapse-btn"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? "메뉴 펼치기" : "메뉴 접기"}
        >
          <span className="app-sidebar-collapse-icon">
            {isCollapsed ? "›" : "‹"}
          </span>
          <span className="app-sidebar-collapse-label">
            {isCollapsed ? "펼치기" : "접기"}
          </span>
        </button>

        <div className="app-sidebar-user">
          <div className="app-user-avatar">
            {loginUser.slice(0, 1).toUpperCase()}
          </div>
          <div className="app-sidebar-user-text">
            <strong>{displayName}</strong>
            <span>{loginUser}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
