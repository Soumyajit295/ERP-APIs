export class Tenant {
    id!: string;
    companyName!: string;
    city!: string | null;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;
}