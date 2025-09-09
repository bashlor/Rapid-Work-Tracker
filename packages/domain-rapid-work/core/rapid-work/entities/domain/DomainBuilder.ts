import { v7 } from "uuid";

import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";
import { SubDomain } from "../subdomain/SubDomain";
import { Domain } from "./Domain";

export class DomainBuilder {
  private createdAt: DateTime;
  private id: Id;
  private name: Label | null = null;
  private subDomains: SubDomain[] = [];
  private userId: Id | null = null;

  constructor() {
    this.id = new Id(v7());
    this.createdAt = DateTime.now();
  }

  public static fromDomain(domain: Domain) : DomainBuilder {
    const builder = new DomainBuilder();
    builder.id = domain.id;
    builder.userId = domain.userId;
    builder.name = domain.name;
    builder.createdAt = domain.createdAt;
    builder.subDomains = domain.subDomains;
    return builder;
  }

  public build(): Domain {
    if (!this.userId) {
      throw new Error("UserId is required");
    }
    if (!this.name) {
      throw new Error("Name is required");
    }
    return new Domain(this.id, this.userId, this.name, this.createdAt, this.subDomains);
  }

  public generateId(): DomainBuilder {
    this.id = new Id(v7());
    return this;
  }

  public withCreatedAt(createdAt: Date | string): DomainBuilder {
    this.createdAt = new DateTime(createdAt);
    return this;
  }

  public withId(id: string): DomainBuilder {
    this.id = new Id(id);
    return this;
  }

  public withName(name: string): DomainBuilder {
    this.name = new Label(name);
    return this;
  }


  public withSubDomains(subDomains: SubDomain[]): DomainBuilder {
    this.subDomains = subDomains;
    return this;
  }

  public withUserId(userId: string): DomainBuilder {
    this.userId = new Id(userId);
    return this;
  }
}
