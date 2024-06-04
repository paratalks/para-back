export interface signupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests:[string];
  fcmToken:string;
}

export interface parasignupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests: [string];
  fcmToken: string;
  expertise: [string];
  availability: { day: number; slots: String[] }[];
  packageOption: {
    title: string;
    type: string;
    amount: number;
  }[];
  profilePicture: string;
}