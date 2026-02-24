export type Mood = 'good' | 'okay' | 'bad';

export type ReviewNote = {
  id: number;
  shiftDate: string;
  goodThings: string | null;
  mistakes: string | null;
  feedback: string | null;
  nextReview: string | null;
  mood: Mood | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewInput = {
  shiftDate: string;
  goodThings?: string;
  mistakes?: string;
  feedback?: string;
  nextReview?: string;
  mood?: Mood;
};
