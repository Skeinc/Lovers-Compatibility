import type { DiscussionTopic } from "@/entities/compatibility/@x/report";

export const DISCUSSION_TOPIC_LABEL: Record<DiscussionTopic, string> = {
  family: "семья через 10 лет",
  relocation: "переезд ради работы",
  earnings: "кто будет зарабатывать больше через 10 лет",
  values: "три ценности через 10 лет",
  "red-flag": "red flag, который называет партнёр",
  "household-fight": "тема первой большой бытовой ссоры",
};

export const DISCUSSION_QUESTION: Record<DiscussionTopic, string> = {
  family: "Какая картина семьи через 10 лет для вас общая, а какая только чья-то?",
  relocation: "Работа мечты в другом городе: вы едете вместе или каждый решает сам?",
  earnings: "Через 10 лет кто будет зарабатывать больше — и вы оба указываете на одного человека?",
  values: "Из трёх вещей на десять лет вперёд какие две вы оба готовы поставить выше остальных?",
  "red-flag": "Какой red flag вы видите друг в друге — и тот ли это, которого ждёт партнёр?",
  "household-fight": "Из-за чего у вас скорее случится первая большая бытовая ссора?",
};
