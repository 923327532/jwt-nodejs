import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/UserRepository.js";
import roleRepository from "../repositories/RoleRepository.js";

class AuthService {
  async signUp({
    email,
    password,
    name,
    lastName,
    phoneNumber,
    birthdate,
    url_profile = "",
    adress = "",
    roles = ["user"],
  }) {
    const existing = await userRepository.findByEmail(email);

    if (existing) {
      const err = new Error("El email ya se encuentra en uso");
      err.status = 400;
      throw err;
    }

    const saltRounds = parseInt(
      process.env.BCRYPT_SALT_ROUNDS ??
      process.env.BCRYPTSALTROUNDS ??
      10,
      10
    );

    const hashed = await bcrypt.hash(password, saltRounds);

    const roleDocs = [];

    for (const r of roles) {
      let roleDoc = await roleRepository.findByName(r);

      if (!roleDoc) {
        roleDoc = await roleRepository.create({ name: r });
      }

      roleDocs.push(roleDoc.id);
    }

    const user = await userRepository.create({
      email,
      password: hashed,
      name,
      lastName,
      phoneNumber,
      birthdate,
      url_profile,
      adress,
      roles: roleDocs,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }

  async signIn({ email, password }) {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      const err = new Error("Credenciales inválidas");
      err.status = 401;
      throw err;
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
      const err = new Error("Credenciales inválidas");
      err.status = 401;
      throw err;
    }

    const roles = user.roles.map((r) => r.name);

    const token = jwt.sign(
      { sub: user.id, roles },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        roles,
      },
    };
  }
}

export default new AuthService();