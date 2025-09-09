import { v7 } from "uuid";

import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";
import { SubDomain } from "./SubDomain";

export class SubDomainBuilder {
  private createdAt: DateTime = DateTime.now();
  private domainId: Id | null = null;
  private id: Id;
  private name: Label | null = null;

  constructor() {
    this.id = new Id(v7());
    this.createdAt = DateTime.now();
  }

  public build(): SubDomain {
    if (!this.domainId) {
      throw new Error("DomainId is required");
    }
    if (!this.name) {
      throw new Error("Name is required");
    }
    return new SubDomain(this.id, this.domainId, this.name, this.createdAt);
  }

  public generateId(): SubDomainBuilder {
    this.id = new Id(v7());
    return this;
  }

  public withCreatedAt(createdAt: Date | string): SubDomainBuilder {
    this.createdAt = new DateTime(createdAt);
    return this;
  }

  public withDomainId(domainId: string): SubDomainBuilder {
    this.domainId = new Id(domainId);
    return this;
  }

  public withId(id: string): SubDomainBuilder {
    this.id = new Id(id);
    return this;
  }

  public withName(name: string): SubDomainBuilder {
    this.name = new Label(name);
    return this;
  }
}
