import { Store } from "./store";

export type Form = {
  documentId: string;
  id: number;
  name: string;
  message: string;
  structure: any;
  seo: SEO;
  store: Store;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
