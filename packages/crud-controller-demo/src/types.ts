/** */
export interface Thing {
    /** generic */
    id: string;
    name: string;
    displayName: string;
    notes: string;
    /** generic */
    createdAt: number;
    /** generic */
    updatedAt: number;
    /** generic: owner/user id */
    userid: string;
  }