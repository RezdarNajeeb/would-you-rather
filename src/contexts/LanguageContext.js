import React, { createContext, useState, useEffect } from "react";

// Create context
export const LanguageContext = createContext();

// Define language constants
export const LANGUAGES = {
  ENGLISH: "en",
  KURDISH: "ku",
};

// Translations for UI elements
export const translations = {
  [LANGUAGES.ENGLISH]: {
    appTitle: "Would You Rather?",
    loading: "Loading questions...",
    questionNumber: "Question",
    of: "of",
    versus: "VS",
    gameComplete: "Game Complete!",
    answeredAll: "You've answered all the questions.",
    statsText: "How did your choices compare to others?",
    playAgain: "Play Again",
    themeToggle: "Dark Mode",
    languageToggle: "Kurdish",
    menu: "Menu",
    noQuestions: "No questions available. Please check your database.",
  },
  [LANGUAGES.KURDISH]: {
    appTitle: "باشتر دەزانی؟",
    loading: "بارکردنی پرسیارەکان...",
    questionNumber: "پرسیار",
    of: "لە",
    versus: "دژی",
    gameComplete: "یاری تەواو بوو!",
    answeredAll: "تۆ هەموو پرسیارەکانت وەڵام داوەتەوە.",
    statsText: "چۆن هەڵبژاردنەکانت بەراورد دەکرێن لەگەڵ ئەوانی تر؟",
    playAgain: "دووبارە یاری بکە",
    themeToggle: "دۆخی تاریک",
    languageToggle: "کوردی",
    menu: "مێنیو",
    noQuestions: "هیچ پرسیارێک بەردەست نییە. تکایە بنکەی داتاکەت بپشکنە.",
  },
};

const LanguageProvider = ({ children }) => {
  // Get saved language from localStorage or use English as default
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("language");
    return savedLanguage || LANGUAGES.ENGLISH;
  });

  // Update localStorage when language changes
  useEffect(() => {
    localStorage.setItem("language", language);

    // Set dir attribute for RTL (Kurdish) or LTR (English)
    document.documentElement.setAttribute(
      "dir",
      language === LANGUAGES.KURDISH ? "rtl" : "ltr"
    );

    // Add lang attribute to document
    document.documentElement.setAttribute("lang", language);
  }, [language]);

  // Toggle language function
  const toggleLanguage = () => {
    setLanguage((prevLanguage) =>
      prevLanguage === LANGUAGES.ENGLISH ? LANGUAGES.KURDISH : LANGUAGES.ENGLISH
    );
  };

  // Get translated text
  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
