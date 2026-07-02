export interface Task {
  id: string;
  text: string;
  done: boolean;
}

export interface Member {
  id: string;
  name: string;
  count: number | string;
  date: string;
  tasks: Task[];
}

export interface Week {
  id: string;
  startLabel: string;
  members: Member[];
}

export interface PlanState {
  activeWeekId: string;
  weeks: Week[];
}
