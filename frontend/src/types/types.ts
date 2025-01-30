export type Utilisateur = {
    id: number;
    username: string;
    email: string | null;
    first_name: string;
    last_name: string;
  };


export type Post = {
    id: number;
    content: string;
    created_at: Date;
    media_files: string[] | null;
    author: Utilisateur;
  };

export interface FilePreview {
  id:string,
  type: string;
  url: string;
  name: string;
  file: File;
  progress: number;
  status: string;
}