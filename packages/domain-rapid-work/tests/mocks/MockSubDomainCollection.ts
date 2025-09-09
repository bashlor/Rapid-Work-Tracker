import { SubDomainCollection } from "../../core/rapid-work/collections/SubDomainCollection";
import { SubDomain } from "../../core/rapid-work/entities/subdomain/SubDomain";
import { Id } from "../../kernel/id";
import { generateUUIDv7 } from "../helpers/uuid-helper";

export class MockSubDomainCollection extends SubDomainCollection {
  // Map userIdKey -> SubDomain[]
  private subDomains: Map<string, SubDomain[]> = new Map();

  addMockSubDomain(userId: Id, subDomain: SubDomain) {
    const uid = this.keyOfId(userId);
    const list = this.subDomains.get(uid) || [];
    list.push(subDomain);
    this.subDomains.set(uid, list);
  }

  // Helper methods for testing
  clear(): void {
    this.subDomains = new Map();
  }

  async delete(userId: Id, id: Id): Promise<boolean> {
    const uidKey = this.keyOfId(userId);
    const list = this.subDomains.get(uidKey) || [];
    const index = list.findIndex((sd) => sd.id.value === id.value);
    if (index === -1) return false;
    list.splice(index, 1);
    this.subDomains.set(uidKey, list);
    return true;
  }

  getAll(): SubDomain[] {
    let all: SubDomain[] = [];
    for (const list of this.subDomains.values()) {
      all = all.concat(list);
    }
    return all;
  }

  async getAllByDomainId(userId: Id, domainId: Id): Promise<SubDomain[]> {
    const list = this.subDomains.get(this.keyOfId(userId)) || [];
    return list.filter((sd) => sd.domainId.value === domainId.value);
  }

  async getById(userId: Id, id: Id): Promise<null | SubDomain> {
    const list = this.subDomains.get(this.keyOfId(userId)) || [];
    return list.find((sd) => sd.id.value === id.value) || null;
  }

  async insert(userId: Id, subDomain: SubDomain): Promise<SubDomain> {
    const uidKey = this.keyOfId(userId);

    const id = subDomain.id || new Id(generateUUIDv7());

    const insertedSubDomain = new SubDomain(
      id,
      subDomain.domainId,
      subDomain.name,
      subDomain.createdAt,
    );

    const list = this.subDomains.get(uidKey) || [];
    list.push(insertedSubDomain);
    this.subDomains.set(uidKey, list);

    return insertedSubDomain;
  }

  async insertMany(userId: Id, subDomains: SubDomain[]): Promise<SubDomain[]> {
    const inserted: SubDomain[] = [];
    for (const subDomain of subDomains) {
      inserted.push(await this.insert(userId, subDomain));
    }
    return inserted;
  }

  async update(userId: Id, subDomain: SubDomain): Promise<SubDomain> {
    const uidKey = this.keyOfId(userId);
    const list = this.subDomains.get(uidKey);
    if (!list) throw new Error("SubDomain not found for user");

    const index = list.findIndex((x) => x.id.value === subDomain.id.value);
    if (index === -1) throw new Error("SubDomain not found");

    list[index] = subDomain;
    this.subDomains.set(uidKey, list);
    return subDomain;
  }

  async updateMany(userId: Id, subDomains: SubDomain[]): Promise<SubDomain[]> {
    const updated: SubDomain[] = [];
    for (const subDomain of subDomains) {
      updated.push(await this.update(userId, subDomain));
    }
    return updated;
  }

  private keyOfId(id: Id): string {
    return id.value;
  }
}
