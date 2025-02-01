export interface Utilisateur {
    id: number;
    username: string;
    email: string | null;
    first_name: string;
    last_name: string;
  };


export interface Post {
    id: number,
    content: string,
    created_at: string,
    author: {
      id: 1,
      first_name: string,
      last_name: string,
      profile_pic: string
    },
    job: string,
    reactions: number,
    comments: number,
    mediaFiles: string[],
  }

export interface FilePreview {
  id:string,
  type: string;
  url: string;
  name: string;
  file: File;
  progress: number;
  status: string;
}