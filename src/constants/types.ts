export interface signupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
}

export interface parasignupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests: string;
  expertise: string;
  availability: { day: number; slots: String }[];
  pricing: Number;
  profilePicture: string;
}