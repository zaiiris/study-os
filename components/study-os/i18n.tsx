"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";

export type Language = "en" | "ru";

const messages = {
  en: {
    deadlines: "Deadlines",
    dashboard: "Dashboard", planner: "Planner", tasks: "Tasks", exams: "Exams", universities: "Universities",
    applications: "Applications", documents: "Documents", competitions: "Competitions", projects: "Projects",
    resources: "Resources", analytics: "Analytics", settings: "Settings", workspace: "Personal workspace",
    search: "Search tasks…", newTask: "New task", goodMorning: "Good morning", attention: "Here’s what needs your attention today.",
    activeTasks: "active tasks", savedOffline: "saved offline", satCountdown: "SAT countdown", days: "days",
    satScore: "SAT score", targetProgress: "Target progress", currentBand: "Current overall band", deadlinesMonth: "2 deadlines this month",
    todayFocus: "Today’s focus", all: "All", loading: "Loading your local workspace…", noTasks: "No matching tasks",
    changeFilter: "Create a task or change the current filter.", applicationPipeline: "Application pipeline", openTracker: "Open tracker",
    researching: "Researching", preparing: "Preparing", submitted: "Submitted", upcomingDeadlines: "Upcoming deadlines",
    weeklyProgress: "Weekly progress", studyPlan: "Study plan", tasksCompleted: "Tasks completed", satTarget: "SAT score target",
    createTask: "Create task", editTask: "Edit task", localSave: "This task is saved privately in your browser.",
    title: "Title", description: "Description", category: "Category", priority: "Priority", deadline: "Deadline", cancel: "Cancel",
    saveChanges: "Save changes", backup: "Backup & restore", exportBackup: "Export backup", restoreBackup: "Restore backup",
    add: "Add", delete: "Delete", status: "Status", date: "Date", progress: "Progress", empty: "Nothing here yet",
    plannerIntro: "Plan study blocks around your most important deadlines.", tasksIntro: "Capture, prioritize, and complete every next action.",
    examsIntro: "Track current scores, targets, test dates, and weak areas.", universitiesIntro: "Compare universities and keep research in one place.",
    applicationsIntro: "See every application stage and submission milestone.", documentsIntro: "Track the documents required across all applications.",
    competitionsIntro: "Manage competition deadlines, preparation, and results.", projectsIntro: "Keep long-term academic and technical projects moving.",
    resourcesIntro: "Save useful preparation and research links.", analyticsIntro: "Understand your progress across study and admissions.",
    settingsIntro: "Manage language, profile, and local backups.", today: "Today", thisWeek: "This week", completed: "Completed",
  },
  ru: {
    deadlines: "Дедлайны",
    dashboard: "Главная", planner: "Планер", tasks: "Задачи", exams: "Экзамены", universities: "Университеты",
    applications: "Заявки", documents: "Документы", competitions: "Конкурсы", projects: "Проекты",
    resources: "Ресурсы", analytics: "Аналитика", settings: "Настройки", workspace: "Личное пространство",
    search: "Поиск по задачам…", newTask: "Новая задача", goodMorning: "Доброе утро", attention: "Вот что сегодня требует вашего внимания.",
    activeTasks: "активных задач", savedOffline: "сохранено локально", satCountdown: "До SAT", days: "дней",
    satScore: "Баллы SAT", targetProgress: "Прогресс к цели", currentBand: "Текущий общий балл", deadlinesMonth: "2 дедлайна в этом месяце",
    todayFocus: "Фокус на сегодня", all: "Все", loading: "Загружаем локальные данные…", noTasks: "Подходящих задач нет",
    changeFilter: "Создайте задачу или измените фильтр.", applicationPipeline: "Этапы поступления", openTracker: "Открыть трекер",
    researching: "Изучаю", preparing: "Готовлю", submitted: "Отправлено", upcomingDeadlines: "Ближайшие дедлайны",
    weeklyProgress: "Прогресс за неделю", studyPlan: "Учебный план", tasksCompleted: "Завершённые задачи", satTarget: "Цель по SAT",
    createTask: "Создать задачу", editTask: "Редактировать задачу", localSave: "Задача сохранится только в вашем браузере.",
    title: "Название", description: "Описание", category: "Категория", priority: "Приоритет", deadline: "Дедлайн", cancel: "Отмена",
    saveChanges: "Сохранить", backup: "Резервная копия", exportBackup: "Экспортировать", restoreBackup: "Восстановить",
    add: "Добавить", delete: "Удалить", status: "Статус", date: "Дата", progress: "Прогресс", empty: "Пока ничего нет",
    plannerIntro: "Планируйте учебные блоки вокруг самых важных дедлайнов.", tasksIntro: "Фиксируйте, расставляйте приоритеты и завершайте следующие шаги.",
    examsIntro: "Следите за текущими баллами, целями, датами и слабыми темами.", universitiesIntro: "Сравнивайте университеты и храните исследования в одном месте.",
    applicationsIntro: "Контролируйте каждый этап подачи и важные даты.", documentsIntro: "Следите за документами для всех заявок.",
    competitionsIntro: "Управляйте дедлайнами, подготовкой и результатами конкурсов.", projectsIntro: "Продвигайте долгосрочные учебные и технические проекты.",
    resourcesIntro: "Сохраняйте полезные материалы и ссылки.", analyticsIntro: "Анализируйте прогресс в учёбе и поступлении.",
    settingsIntro: "Управляйте языком, профилем и локальными копиями.", today: "Сегодня", thisWeek: "На этой неделе", completed: "Завершено",
  },
} as const;

export type MessageKey = keyof typeof messages.en;
const I18nContext = createContext({ language: "en" as Language, setLanguage: (next: Language) => { void next; }, t: (key: MessageKey) => messages.en[key] as string });

let transientLanguage:Language='en';
const languageListeners=new Set<()=>void>();
function readLanguage():Language {
  try { const saved=localStorage.getItem('study-os-language');return saved==='ru'||saved==='en'?saved:transientLanguage; }
  catch { return transientLanguage; }
}
function subscribeLanguage(listener:()=>void) {
  languageListeners.add(listener);
  const storage=(event:StorageEvent)=>{if(event.key==='study-os-language')listener();};
  window.addEventListener('storage',storage);
  return ()=>{languageListeners.delete(listener);window.removeEventListener('storage',storage);};
}
const serverLanguage=():Language|null=>null;
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const savedLanguage=useSyncExternalStore(subscribeLanguage,readLanguage,serverLanguage);
  const language=savedLanguage??'en';
  const value=useMemo(()=>({language,setLanguage:(next:Language)=>{
    transientLanguage=next;
    try {localStorage.setItem('study-os-language',next);} catch { /* Preference remains usable when browser storage is blocked. */ }
    languageListeners.forEach(listener=>listener());
  },t:(key:MessageKey)=>messages[language][key] as string}),[language]);
  // Hydrate a language-neutral shell, never English admissions paragraphs before saved RU loads.
  return <I18nContext.Provider value={value}>{savedLanguage===null?<div aria-label="Study OS" className="min-h-screen bg-white"/>:children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
