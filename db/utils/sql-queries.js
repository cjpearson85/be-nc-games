const format = require("pg-format");

exports.insertToTable = (table, columns, values) => {
  return format(`
    INSERT INTO %I
    (%I)
    VALUES
    %L`,
    table,
    columns,
    values
  );
};