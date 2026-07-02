import type { PlanState, Task } from "./types";

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function defaultTasks(list: string[]): Task[] {
  return list.map((t) => ({ id: uid(), text: t, done: false }));
}

export function seedData(): PlanState {
  return {
    activeWeekId: "w1",
    weeks: [
      {
        id: "w1",
        startLabel: "01.07.2026",
        members: [
          {
            id: uid(),
            name: "Malika",
            count: 10,
            date: "2026-07-01",
            tasks: defaultTasks([
              "kamida operator va 3 ta kattaqo'rg'on",
              "memorandum data olingan bo'ladi",
              "so'rovnoma",
            ]),
          },
          {
            id: uid(),
            name: "Nurjamol",
            count: 11,
            date: "2026-07-01",
            tasks: defaultTasks([
              "4 ta Algoritm",
              "Admin (Chirchiq)",
              "Nukus (spisokka o'tgan bo'ladi)",
            ]),
          },
          {
            id: uid(),
            name: "Axmadiyor",
            count: 26,
            date: "2026-07-01",
            tasks: defaultTasks(["2 ta target", "6 ta zayavka", "2 ta dars", "memorandum"]),
          },
          {
            id: uid(),
            name: "Botir",
            count: 13,
            date: "2026-07-01",
            tasks: defaultTasks(["7 ta zayavka bor"]),
          },
        ],
      },
    ],
  };
}
