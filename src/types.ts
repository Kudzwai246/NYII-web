export type EoiData = {
  fullname: string;
  phone?: string;
  email?: string;
  location?: string;
  role: string;
  ageGroup?: string;
  interests: string[];
  likelyToEnroll: string;
  wantsUpdates: boolean;
  comments?: string;
};

export type EoiResponse = {
  success: boolean;
  message?: string;
  error?: string;
};

export type Stats = {
  total: number;
  optInUpdates: number;
  byRole: { role: string; count: number }[];
  byLocation: { location: string; count: number }[];
  topInterests: { name: string; count: number }[];
};

export type EoiSubmission = EoiData & {
  id: number;
  createdAt: string;
};
