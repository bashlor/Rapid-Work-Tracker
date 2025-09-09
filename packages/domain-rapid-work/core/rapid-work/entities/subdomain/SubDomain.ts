import { DateTime } from "../../../../kernel/datetime";
import { Id } from "../../../../kernel/id";
import { Label } from "../../../../kernel/label";


export interface SubDomainData {
  createdAt: string;
  domainId: string;
  id: string;
  name: string;
}

export class SubDomain {
  constructor(
    public readonly id: Id,
    public readonly domainId: Id,
    public readonly name: Label,
    public readonly createdAt: DateTime,
  ) {}
}
