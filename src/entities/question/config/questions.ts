import type { Question } from "../model/types";

export const QUESTIONS: readonly Question[] = [
  {
    id: "perfect-weekend",
    kind: "choice-predict",
    category: "preferences",
    title: "Как выглядит твой идеальный совместный выходной?",
    description: "Не тот, который «надо бы», а тот, после которого не хочется понедельника.",
    options: [
      { id: "home", label: "Лежать дома и ничего не делать" },
      { id: "city", label: "Ресторан, бар, город" },
      { id: "nature", label: "Природа" },
      { id: "trip", label: "Спонтанно куда-нибудь уехать" },
      { id: "friends", label: "Тусовка с друзьями" },
      { id: "parallel", label: "Каждый своим делом, но мы рядом" },
    ],
  },
  {
    id: "surprise-money",
    kind: "choice-predict",
    category: "values",
    title: "Вам внезапно переводят 100 000 ₽. Что происходит?",
    description: "Деньги уже на карте. Плана «как правильно» нет.",
    options: [
      { id: "save", label: "Откладываем" },
      { id: "travel", label: "Путешествие" },
      { id: "wish", label: "Покупаем что-то давно желанное" },
      { id: "split", label: "Делим, и каждый тратит свою часть" },
      { id: "invest", label: "Инвестируем" },
      { id: "spent", label: "Какие деньги? Мы их уже потратили" },
    ],
  },
  {
    id: "after-conflict",
    kind: "choice-predict",
    category: "dynamics",
    title: "После небольшой ссоры ты обычно...",
    description: "Не драма на три дня. Обычная искра.",
    options: [
      { id: "first", label: "Первым иду мириться" },
      { id: "wait", label: "Жду, пока партнёр остынет" },
      { id: "ignore", label: "Делаю вид, что ничего не было" },
      { id: "talk", label: "Начинаю всё обсуждать" },
      { id: "space", label: "Ухожу заниматься своими делами" },
      { id: "joke", label: "Пытаюсь разрядить ситуацию шуткой" },
    ],
  },
  {
    id: "ideal-date",
    kind: "choice-predict",
    category: "preferences",
    title: "Какое свидание ты правда считаешь идеальным?",
    description: "То, на которое согласишься даже в уставший четверг.",
    options: [
      { id: "dinner", label: "Тихий ужин вдвоём" },
      { id: "walk", label: "Прогулка без плана" },
      { id: "event", label: "Концерт или ивент" },
      { id: "home", label: "Дом, фильм и еда" },
      { id: "weird", label: "Что-то новое и слегка странное" },
      { id: "active", label: "Активный день: спорт, квест, поездка" },
    ],
  },
  {
    id: "future-irritation",
    kind: "multi-predict",
    category: "dynamics",
    title: "Что из этого скорее всего начнёт раздражать тебя через год совместной жизни?",
    description: "Можно несколько. «Ничего из этого» — отдельный честный ответ.",
    options: [
      { id: "mess", label: "Разбросанные вещи" },
      { id: "dishes", label: "Посуда" },
      { id: "late", label: "Опоздания" },
      { id: "phone", label: "Телефон во время разговора" },
      { id: "music", label: "Громкая музыка" },
      { id: "later", label: "«Я сейчас» вместо реального действия" },
      { id: "nothing", label: "Ничего из этого", exclusive: true },
    ],
  },
  {
    id: "extra-hours",
    kind: "choice-predict",
    category: "values",
    title: "Зарплата выше на 30%, но в неделе на 10 рабочих часов больше. Берёшь?",
    description: "Не теория карьеры. Этот конкретный обмен.",
    options: [
      { id: "definitely-yes", label: "Конечно да" },
      { id: "rather-yes", label: "Скорее да" },
      { id: "depends", label: "Зависит от денег" },
      { id: "rather-no", label: "Скорее нет" },
      { id: "definitely-no", label: "Точно нет" },
    ],
  },
  {
    id: "lost-in-city",
    kind: "choice-predict",
    category: "preferences",
    title: "Вы заблудились в незнакомом городе. Что происходит?",
    description: "Карта врёт, ноги уже гудят, кафе где-то рядом.",
    options: [
      { id: "maps", label: "Кто-то сразу открывает карты" },
      { id: "argue", label: "Оба спорят, куда идти" },
      { id: "wander", label: "Идём куда глаза глядят" },
      { id: "cafe", label: "Ищем ближайшее кафе и разбираемся там" },
      { id: "blame", label: "Обвиняем друг друга в выборе маршрута" },
    ],
  },
  {
    id: "free-year",
    kind: "text",
    category: "text",
    title: "Если бы вам прямо сейчас подарили год полной финансовой свободы, что бы вы сделали?",
    description: "Одно-два предложения. Без пятилетнего плана.",
    placeholder: "Например: уехали бы на полгода и никому не обещали дат",
  },
  {
    id: "favorite-trait",
    kind: "text",
    category: "narrative",
    title: "Какая черта партнёра тебе нравится больше всего?",
    description: "Не «всё». Одна конкретная.",
    placeholder: "Одна черта, своими словами",
  },
  {
    id: "annoying-habit",
    kind: "text",
    category: "narrative",
    title: "Какая привычка партнёра тебя иногда раздражает, но если её внезапно убрать — ты бы всё равно скучал(а)?",
    description: "Это может быть смешным. Так даже лучше.",
    placeholder: "Привычка, без которой было бы тише и скучнее",
  },
  {
    id: "who-is-more-likely",
    kind: "who-likely",
    category: "dynamics",
    title: "Кто из вас скорее?",
    description: "Шесть коротких сцен. Выбирай себя или партнёра.",
    scenarios: [
      { id: "delivery", prompt: "Кто скорее предложит заказать доставку?" },
      { id: "impulse", prompt: "Кто скорее потратит деньги импульсивно?" },
      { id: "trip", prompt: "Кто скорее предложит спонтанно уехать?" },
      { id: "lost", prompt: "Кто скорее потеряется?" },
      { id: "makeup", prompt: "Кто скорее первым скажет «ладно, давай мириться»?" },
      { id: "room", prompt: "Кто скорее забудет, зачем пришёл в комнату?" },
    ],
  },
  {
    id: "three-words",
    kind: "text-predict",
    category: "text",
    title: "Опишите ваши отношения тремя словами.",
    description: "Именно три. Можно смешные.",
    placeholder: "Три слова через пробел",
  },
];

export function getQuestion(id: string): Question | undefined {
  return QUESTIONS.find((question) => question.id === id);
}

export function optionLabel(question: Question, optionId: string): string {
  return question.options?.find((option) => option.id === optionId)?.label ?? optionId;
}
