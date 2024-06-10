export interface signupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests: [string];
  profilePicture: string;
  fcmToken: string;
}

export interface parasignupObject {
  name: string;
  gender: string;
  dateOfBirth: Date;
  interests: [string];
  fcmToken: string;
  expertise: [string];
  availability: { day: number; slots: String[] }[];
  packages: {
    title: string;
    type: {
      type: String;
      enum: ["online", "offline"];
    };
    description: String;
    amount: number;
  }[];
  profilePicture: string;
  ratings: Number;
  bio: String;
  basedOn: String;
  qualifications: [
    {
      title: String;
      certificateUrls: [String];
    }
  ];
  reviews: [string];
}

export interface paraUpdateObject {
  name: String;
  gender: String;
  interests: [String];
  phone: String;
  expertise: String[];
  availability: [{ day: string; slots: string[] }];
  packages: {
    title: string;
    type: {
      type: String;
      enum: ["online", "offline"];
    };
    description: String;
    amount: number;
  }[];
  profilePicture: String;
  ratings: Number;
  bio: String;
  basedOn: String;
  qualifications: [
    {
      title: String;
      certificateUrls: [String];
    }
  ];
  reviews: [string];
}