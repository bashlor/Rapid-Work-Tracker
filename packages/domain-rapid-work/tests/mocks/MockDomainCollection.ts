import { DomainCollection } from "../../core/rapid-work/collections/DomainCollection";
import { Domain } from "../../core/rapid-work/entities/domain/Domain";
import { Id } from "../../kernel/id";
import { generateUUIDv7 } from "../helpers/uuid-helper";

export class MockDomainCollection extends DomainCollection {
  private domains: Domain[] = [];

  // Helper methods for testing
  clear(): void {
    this.domains = [];
  }

  // Required methods from parent class
  async delete(userId: Id, id: Id): Promise<boolean> {
    const index = this.domains.findIndex((d) => d.id.value === id.value && d.userId.value === userId.value);
    if (index === -1) {
      return false;
    }
    this.domains.splice(index, 1);
    return true;
  }

  findById(id: Id): Domain | null {
    return this.domains.find((d) => d.id.value === id.value) || null;
  }

  getAll(): Domain[] {
    return [...this.domains];
  }

  async getAllByUserId(userId: Id): Promise<Domain[]> {
    return this.domains.filter((d) => d.userId.value === userId.value);
  }

  async getById(userId: Id, id: Id): Promise<Domain | null> {
    return this.domains.find((d) => d.id.value === id.value && d.userId.value === userId.value) || null;
  }

  async insert(domain: Domain): Promise<Domain> {
    // Use the existing ID if present, otherwise generate a new one
    const id = domain.id || new Id(generateUUIDv7());

    // Create a new domain with the ID
    const insertedDomain = new Domain(
      id,
      domain.userId,
      domain.name,
      domain.createdAt,
      domain.subDomains,
    );

    this.domains.push(insertedDomain);
    return insertedDomain;
  }

  async update(domain: Domain): Promise<Domain> {
    const index = this.domains.findIndex(
      (d) => d.id.value === domain.id.value,
    );
    if (index === -1) {
      throw new Error("Domain not found");
    }
    this.domains[index] = domain;
    return domain;
  }
}
