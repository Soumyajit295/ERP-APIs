export class Tenant {
    id!: string;
    company_name!: string;
    company_email!: string;
    phone!: string | null;
    city!: string | null;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;
}