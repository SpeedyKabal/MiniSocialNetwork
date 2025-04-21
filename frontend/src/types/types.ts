export interface Utilisateur {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    profile_pic: string;
  };

export interface Post {
    id: number,
    content: string,
    created_at: string,
    author: Utilisateur
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
  progressProcessing: number,
  status: string;
}