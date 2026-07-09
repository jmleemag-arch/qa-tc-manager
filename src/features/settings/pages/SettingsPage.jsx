import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import BackupSettingsPanel from "../components/BackupSettingsPanel";
import BasicSettingsPanel from "../components/BasicSettingsPanel";
import IntegrationsSettingsPanel from "../components/IntegrationsSettingsPanel";
import NotificationsSettingsPanel from "../components/NotificationsSettingsPanel";
import PermissionsSettingsPanel from "../components/PermissionsSettingsPanel";
import SystemInfoPanel from "../components/SystemInfoPanel";
import TestRunsSettingsPanel from "../components/TestRunsSettingsPanel";
import UsersSettingsPanel from "../components/UsersSettingsPanel";
import VersionsSettingsPanel from "../components/VersionsSettingsPanel";
import {
  EDITABLE_SECTION_IDS,
  SETTINGS_SAVED_MESSAGE,
  SETTINGS_SECTIONS,
} from "../constants/settingsConstants";
import {
  loadAppSettings,
  readAppSettings,
  writeAppSettings,
} from "../utils/settingsStorage";

const BASIC_SECTION = SETTINGS_SECTIONS[0];

function SettingsPage({
  loginUser,
  onLogout,
  activeMenu,
  onMenuChange,
  pageTitle,
  notifications,
  onNotificationClick,
  onMarkAllNotificationsRead,
  routeParams = {},
  onRouteChange,
}) {
  const activeSectionId = routeParams.section ?? BASIC_SECTION.id;
  const activeSection =
    SETTINGS_SECTIONS.find((section) => section.id === activeSectionId) ??
    BASIC_SECTION;
  const [settings, setSettings] = useState(() => readAppSettings());
  const [savedMessage, setSavedMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditableSection = EDITABLE_SECTION_IDS.has(activeSection.id);

  useEffect(() => {
    let isMounted = true;

    loadAppSettings()
      .then((loadedSettings) => {
        if (isMounted) {
          setSettings(loadedSettings);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadAppSettings().then((loadedSettings) => {
      setSettings(loadedSettings);
    });
  }, [activeSectionId]);

  const sectionDescription = useMemo(() => {
    switch (activeSection.id) {
      case "basic":
        return "시스템의 기본 동작 방식을 설정합니다.";
      case "users":
        return "QA 팀 사용자 계정과 역할을 관리합니다.";
      case "permissions":
        return "역할별 메뉴 접근 권한을 설정합니다.";
      case "notifications":
        return "알림 유형과 수신 채널을 설정합니다.";
      case "integrations":
        return "외부 협업 도구와 Webhook 연동을 설정합니다.";
      case "versions":
        return "릴리즈 버전 관리 규칙을 설정합니다.";
      case "testruns":
        return "테스트 런 생성 및 실행 기본값을 설정합니다.";
      case "backup":
        return "로컬 데이터를 백업하고 복원합니다.";
      case "system":
        return "애플리케이션 버전 및 환경 정보를 확인합니다.";
      default:
        return "";
    }
  }, [activeSection.id]);

  const handleSectionChange = (sectionId) => {
    onRouteChange?.({
      section: sectionId === BASIC_SECTION.id ? null : sectionId,
    });
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const savedSettings = await writeAppSettings(settings);
      setSettings(savedSettings);
      setSavedMessage(SETTINGS_SAVED_MESSAGE);
      window.setTimeout(() => setSavedMessage(""), 2400);
    } catch {
      window.alert("설정을 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const renderPanel = () => {
    if (loading) {
      return <p className="df-page-description">설정을 불러오는 중입니다...</p>;
    }

    switch (activeSection.id) {
      case "basic":
        return <BasicSettingsPanel settings={settings} onChange={setSettings} />;
      case "users":
        return <UsersSettingsPanel settings={settings} onChange={setSettings} />;
      case "permissions":
        return (
          <PermissionsSettingsPanel settings={settings} onChange={setSettings} />
        );
      case "notifications":
        return (
          <NotificationsSettingsPanel settings={settings} onChange={setSettings} />
        );
      case "integrations":
        return (
          <IntegrationsSettingsPanel settings={settings} onChange={setSettings} />
        );
      case "versions":
        return <VersionsSettingsPanel settings={settings} onChange={setSettings} />;
      case "testruns":
        return <TestRunsSettingsPanel settings={settings} onChange={setSettings} />;
      case "backup":
        return <BackupSettingsPanel settings={settings} onChange={setSettings} />;
      case "system":
        return <SystemInfoPanel loginUser={loginUser} settings={settings} />;
      default:
        return null;
    }
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
      <div className="st-page">
        <aside className="st-nav">
          <p className="st-nav-title">설정</p>
          <nav>
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                type="button"
                className={
                  section.id === activeSection.id
                    ? "st-nav-item active"
                    : "st-nav-item"
                }
                onClick={() => handleSectionChange(section.id)}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="st-content">
          <header className="st-content-header">
            <div>
              <h2>{activeSection.label}</h2>
              <p>{sectionDescription}</p>
            </div>
            {isEditableSection ? (
              <div className="st-save-wrap">
                {savedMessage ? (
                  <span className="st-save-message">{savedMessage}</span>
                ) : null}
                <button
                  type="button"
                  className="st-save-btn"
                  onClick={handleSave}
                  disabled={loading || saving}
                >
                  {saving ? "저장 중..." : "변경사항 저장"}
                </button>
              </div>
            ) : null}
          </header>

          {renderPanel()}
        </section>
      </div>
    </MainLayout>
  );
}

export default SettingsPage;
