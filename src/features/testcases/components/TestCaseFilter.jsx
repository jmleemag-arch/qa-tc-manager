import { SIDEBAR_MENUS } from "../constants/testCaseConstants";

function TestCaseFilter({
  menus = SIDEBAR_MENUS,
  selectedMenu,
  onSelectMenu,
  isOpen,
  onToggle,
}) {
  return (
    <aside className={`tc-submenu ${isOpen ? "" : "tc-submenu-collapsed"}`}>
      <div className="tc-submenu-header">
        <button
          type="button"
          className="tc-submenu-toggle-btn"
          onClick={onToggle}
          aria-label={isOpen ? "TC 서브메뉴 접기" : "TC 서브메뉴 펼치기"}
        >
          ☰
        </button>
        {isOpen && <div className="tc-submenu-title">서브메뉴</div>}
      </div>

      {isOpen && (
        <ul className="tc-submenu-list">
          {menus.map((menu) => (
            <li key={menu}>
              <button
                type="button"
                className={
                  selectedMenu === menu
                    ? "tc-submenu-item active"
                    : "tc-submenu-item"
                }
                onClick={() => onSelectMenu(menu)}
              >
                {menu}
              </button>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}

export default TestCaseFilter;
