export class User {
    id!: string;
    tenant_id!: string;
    fname!: string;
    lname!: string;
    email!: string;
    password_hash!: string;
    role!: string;
    is_active!: boolean;
    created_at!: Date;
    updated_at!: Date;
    deleted_at!: Date | null;
}