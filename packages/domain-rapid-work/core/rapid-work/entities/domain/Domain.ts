import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";
import { SubDomain, SubDomainData } from "../subdomain/SubDomain";

export interface DomainData {
  createdAt: string;
  id: string;
  name: string;
  subDomains: SubDomainData[];
  userId: string;
}

export class Domain {
  constructor(
    public readonly id: Id,
    public readonly userId: Id,
    public readonly name: Label,
    public readonly createdAt: DateTime,
    public readonly subDomains: SubDomain[],
  ) {}
}

export function toDomain(data: DomainData): Domain {
  return new Domain(
    new Id(data.id),
    new Id(data.userId),
    new Label(data.name),
    new DateTime(data.createdAt),
    data.subDomains.map((subDomain) => new SubDomain(
      new Id(subDomain.id),
      new Id(subDomain.domainId),
      new Label(subDomain.name),
      new DateTime(subDomain.createdAt),
    )),
  );
}

export function toDomainData(domain: Domain): DomainData {
  return {
    createdAt: domain.createdAt.toISOString(),
    id: domain.id.value,
    name: domain.name.value,
    subDomains: domain.subDomains.map((subDomain) => ({
      createdAt: subDomain.createdAt.toISOString(),
      domainId: subDomain.domainId.value,
      id: subDomain.id.value,
      name: subDomain.name.value,
    })),
    userId: domain.userId.value,
  };
}
