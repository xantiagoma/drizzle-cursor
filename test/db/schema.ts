import {
  AnySQLiteColumn,
  integer,
  numeric,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  firstName: numeric("first_name"),
  middleName: numeric("middle_name"),
  lastName: numeric("last_name"),
  phone: numeric("phone"),
  email: numeric("email"),
  address: numeric("address"),
  postalZip: numeric("postalZip"),
  region: numeric("region"),
  country: numeric("country"),
  list: numeric("list"),
  text: text("text"),
  numberrange: integer("numberrange"),
  currency: numeric("currency"),
  alphanumeric: numeric("alphanumeric"),
  bornDay: numeric("born_day"),
  maritalStatus: numeric("marital_status"),
});
