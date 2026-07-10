import { useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useCustomMenuPool } from "../../../hooks/useCustomMenuPool";
import { useVersions } from "../../../hooks/useVersions";
import TestCaseVersionManager from "../components/TestCaseVersionManager";
import {
  FIXED_VERSION_MENUS,
  getDeleteVersionConfirmMessage,
  SIDEBAR_MENUS,
} from "../constants/testCaseConstants";
import {
  ensureVersionMenus,
  isFixedVersionMenu,
} from "../utils/testCaseUtils";

function VersionManagementPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  onRouteChange,
}) {
  const {
    testCaseVersions: versions,
    createVersion,
    updateVersion: updateVersionApi,
    deleteVersion: deleteVersionApi,
    updateSubmenus,
  } = useVersions();
  const { customMenuPool, setCustomMenuPool } = useCustomMenuPool();
  const [selectedVersionId, setSelectedVersionId] = useState(null);

  const handleAddVersion = async (formData) => {
    const exists = versions.some(
      (version) => version.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전명입니다.");
      return;
    }

    try {
      await createVersion({
        versionName: formData.name,
        description: formData.description,
      });
      setSelectedVersionId(formData.name);
    } catch {
      alert("버전을 저장하지 못했습니다.");
    }
  };

  const handleUpdateVersion = async (versionId, formData) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const exists = versions.some(
      (version) =>
        version.id !== versionId &&
        version.name.toLowerCase() === formData.name.toLowerCase()
    );

    if (exists) {
      alert("이미 등록된 버전명입니다.");
      return;
    }

    try {
      await updateVersionApi(currentVersion.dbId, {
        versionName: formData.name,
        description: formData.description,
      });
    } catch {
      alert("버전을 수정하지 못했습니다.");
    }
  };

  const handleDeleteVersion = async (versionId) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return false;
    }

    const confirmed = window.confirm(
      getDeleteVersionConfirmMessage(currentVersion.name)
    );

    if (!confirmed) {
      return false;
    }

    try {
      await deleteVersionApi(currentVersion.dbId);

      if (selectedVersionId === versionId) {
        setSelectedVersionId(null);
      }

      return true;
    } catch {
      alert("버전을 삭제하지 못했습니다.");
      return false;
    }
  };

  const persistMenus = async (versionId, menus) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    try {
      await updateSubmenus(currentVersion.dbId, menus);
    } catch {
      alert("메뉴 설정을 저장하지 못했습니다.");
    }
  };

  const handleInsertMenu = (versionId, menuName) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    persistMenus(
      versionId,
      ensureVersionMenus([...(currentVersion.menus ?? []), menuName])
    );
  };

  const handleRemoveMenu = (versionId, menuName) => {
    if (isFixedVersionMenu(menuName)) {
      return;
    }

    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    persistMenus(
      versionId,
      (currentVersion.menus ?? []).filter((menu) => menu !== menuName)
    );
  };

  const handleMoveMenu = (versionId, menuName, direction) => {
    const currentVersion = versions.find((version) => version.id === versionId);

    if (!currentVersion) {
      return;
    }

    const optionalMenus = (currentVersion.menus ?? []).filter(
      (menu) => !isFixedVersionMenu(menu)
    );
    const currentIndex = optionalMenus.indexOf(menuName);
    const nextIndex = currentIndex + direction;

    if (
      currentIndex < 0 ||
      nextIndex < 0 ||
      nextIndex >= optionalMenus.length
    ) {
      return;
    }

    const reorderedOptionalMenus = [...optionalMenus];
    const [movedMenu] = reorderedOptionalMenus.splice(currentIndex, 1);
    reorderedOptionalMenus.splice(nextIndex, 0, movedMenu);

    persistMenus(versionId, [
      ...FIXED_VERSION_MENUS,
      ...reorderedOptionalMenus,
    ]);
  };

  const handleAddCustomMenu = async (versionId, label) => {
    const existsInPool = [
      ...SIDEBAR_MENUS,
      ...customMenuPool.map((menu) => menu.label),
    ].some((menu) => menu.toLowerCase() === label.toLowerCase());

    if (existsInPool) {
      alert("이미 등록된 서브메뉴입니다.");
      return;
    }

    await setCustomMenuPool([
      ...customMenuPool,
      { id: `menu-${Date.now()}`, label },
    ]);
    handleInsertMenu(versionId, label);
  };

  const handleApplyVersion = (versionId) => {
    if (!versionId) {
      window.history.pushState(null, "", "/testcases");
      window.dispatchEvent(new PopStateEvent("popstate"));
      return;
    }

    window.history.pushState(null, "", `/versions/${versionId}/test-cases`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <MainLayout
      loginUser={loginUser}
      onLogout={onLogout}
      activeMenu={activeMenu}
      onMenuChange={onMenuChange}
      pageTitle={pageTitle}
      notifications={notifications}
      onNotificationClick={onNotificationClick}
      onMarkAllNotificationsRead={onMarkAllNotificationsRead}
    >
      <section className="tc-version-page">
        <div className="df-page-header">
          <div>
            <p className="df-breadcrumb">홈 &gt; 테스트 관리 &gt; 버전 관리</p>
            <h2>버전 관리</h2>
            <p className="df-page-description">
              릴리즈 버전과 버전별 서브메뉴 구성을 관리합니다.
            </p>
          </div>
        </div>

        <TestCaseVersionManager
          inline
          isOpen
          versions={versions}
          activeVersionId={selectedVersionId}
          customMenuPool={customMenuPool}
          onClose={() => {}}
          onApplyVersion={handleApplyVersion}
          onAddVersion={handleAddVersion}
          onUpdateVersion={handleUpdateVersion}
          onDeleteVersion={handleDeleteVersion}
          onInsertMenu={handleInsertMenu}
          onRemoveMenu={handleRemoveMenu}
          onMoveMenu={handleMoveMenu}
          onAddCustomMenu={handleAddCustomMenu}
        />
      </section>
    </MainLayout>
  );
}

export default VersionManagementPage;
