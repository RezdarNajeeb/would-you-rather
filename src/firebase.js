import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAi56vVxMQrMGbTkIpddp54AzEEEDpp8TQ",
  authDomain: "would-you-rather-99e71.firebaseapp.com",
  databaseURL:
    "https://would-you-rather-99e71-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "would-you-rather-99e71",
  storageBucket: "would-you-rather-99e71.firebasestorage.app",
  messagingSenderId: "737670658095",
  appId: "1:737670658095:web:24dbc858725928ec102eda",
  measurementId: "G-E2KMVTTK3D",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

// Default questions with translations
export const defaultQuestions = [
  {
    id: "1",
    en: {
      optionA: "Be able to fly",
      optionB: "Be invisible",
    },
    ku: {
      optionA: "بتوانی بفڕیت",
      optionB: "نەبینراو بیت",
    },
  },
  {
    id: "2",
    en: {
      optionA: "Live without internet for a year",
      optionB: "Live without AC/heating for a year",
    },
    ku: {
      optionA: "ساڵێک بەبێ ئینتەرنێت بژیت",
      optionB: "ساڵێک بەبێ ساردکەرەوە/گەرمکەرەوە بژیت",
    },
  },
  {
    id: "3",
    en: {
      optionA: "Be 10 years older",
      optionB: "Be 10 years younger",
    },
    ku: {
      optionA: "١٠ ساڵ گەورەتر بیت",
      optionB: "١٠ ساڵ گەنجتر بیت",
    },
  },
  {
    id: "4",
    en: {
      optionA: "Always have to tell the truth",
      optionB: "Always have to lie",
    },
    ku: {
      optionA: "هەمیشە دەبێت ڕاستی بڵێیت",
      optionB: "هەمیشە دەبێت درۆ بکەیت",
    },
  },
  {
    id: "5",
    en: {
      optionA: "Be fluent in all languages",
      optionB: "Be a master of all musical instruments",
    },
    ku: {
      optionA: "لە هەموو زمانەکان شارەزا بیت",
      optionB: "مامۆستای هەموو ئامێرە مۆسیقیەکان بیت",
    },
  },
];

export { database, analytics };
