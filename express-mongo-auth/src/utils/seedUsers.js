import bcrypt from "bcrypt";
import userRepository from "../repositories/UserRepository.js";
import roleRepository from "../repositories/RoleRepository.js";

export default async function seedUsers() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@tecsup.edu.pe";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123@";

  const exists = await userRepository.findByEmail(adminEmail);
  if (exists) {
    console.log("Admin ya existe");
    return;
  }

  let adminRole = await roleRepository.findByName("admin");
  let userRole = await roleRepository.findByName("user");

  if (!adminRole) adminRole = await roleRepository.create({ name: "admin" });
  if (!userRole) userRole = await roleRepository.create({ name: "user" });

  const saltRounds = parseInt(
    process.env.BCRYPTSALTROUNDS ?? 10,
    10
  );
  const hashed = await bcrypt.hash(adminPassword, saltRounds);

  await userRepository.create({
    name: "Admin",
    lastName: "Principal",
    email: adminEmail,
    password: hashed,
    phoneNumber: "999888777",
    birthdate: new Date("2000-01-01"),
    url_profile: "https://i.pravatar.cc/300?img=12",
    adress: "Lima, Perú",
    roles: [adminRole.id, userRole.id],
  });

  console.log(`Admin sembrado: ${adminEmail}`);
}