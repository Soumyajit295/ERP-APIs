export class User {
    id!: string;
    tenantId!: string;
    fname!: string;
    lname!: string;
    email!: string;
    phone?: string;
    roleId!: string;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;
}