exports.up = (pgm) => {
    pgm.createTable("users", {
        id: {
            type: "uuid",
            primaryKey: true,
            notNull: true,
            default: pgm.func("gen_random_uuid()"),
        },
        username: {
            type: "varchar(30)",
            notNull: true,
            unique: true,
        },
        email: {
            type: "varchar(255)",
            notNull: true,
            unique: true,
        },
        password: {
            type: "varchar(255)",
            notNull: true,
        },
        created_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
        updated_at: {
            type: "timestamptz",
            notNull: true,
            default: pgm.func("now()"),
        },
    });
};

exports.down = false;
