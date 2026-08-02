export interface AuditActorSnapshot {
  role: string;
  fullName: string | null;
  cedula: string | null;
}

const store = new Map<string, AuditActorSnapshot>();

export const auditUserCache = {
  get(actorId: string): AuditActorSnapshot | null {
    return store.get(actorId) ?? null;
  },

  set(actorId: string, snapshot: AuditActorSnapshot): void {
    store.set(actorId, snapshot);
  },

  invalidate(actorId: string): void {
    store.delete(actorId);
  },

  clear(): void {
    store.clear();
  },
};
