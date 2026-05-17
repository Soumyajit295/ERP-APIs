-- Up Migration

CREATE TABLE users_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    refresh_token TEXT UNIQUE NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT false,

    expiry TIMESTAMP NOT NULL,

    user_id UUID NOT NULL,

    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_refresh_tokens_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_users_refresh_tokens_user_id
ON users_refresh_tokens(user_id);

CREATE INDEX idx_users_refresh_tokens_token
ON users_refresh_tokens(refresh_token);


-- Down Migration

DROP INDEX IF EXISTS idx_users_refresh_tokens_user_id;

DROP INDEX IF EXISTS idx_users_refresh_tokens_token;

DROP TABLE IF EXISTS users_refresh_tokens;