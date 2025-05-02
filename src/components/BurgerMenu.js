import React, { useState, useContext } from "react";
import { ThemeContext, THEMES } from "../contexts/ThemeContext";
import { LanguageContext, LANGUAGES } from "../contexts/LanguageContext";
import "./BurgerMenu.css";

const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, toggleLanguage, t } = useContext(LanguageContext);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="burger-menu">
      <button
        className={`burger-button ${isOpen ? "open" : ""}`}
        onClick={toggleMenu}
        aria-label={t("menu")}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className={`menu-container ${isOpen ? "open" : ""}`}>
        <div className="menu-items">
          <div className="menu-item">
            <label className="toggle-switch">
              <span>{t("themeToggle")}</span>
              <input
                type="checkbox"
                checked={theme === THEMES.DARK}
                onChange={toggleTheme}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="menu-item">
            <label className="toggle-switch">
              <span>
                {language === LANGUAGES.ENGLISH
                  ? t("languageToggle")
                  : "English"}
              </span>
              <input
                type="checkbox"
                checked={language === LANGUAGES.KURDISH}
                onChange={toggleLanguage}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>
      </div>

      {isOpen && <div className="backdrop" onClick={closeMenu}></div>}
    </div>
  );
};

export default BurgerMenu;
