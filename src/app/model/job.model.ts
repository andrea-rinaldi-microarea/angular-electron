import { Mapping } from "./mapping.model";

export class Job {
    targetTable: string;
    mappings: Mapping[] = [];
}
