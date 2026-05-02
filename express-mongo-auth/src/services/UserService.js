import userRepository from "../repositories/UserRepository.js";

class UserService {
  mapUser(user) {
    return {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      birthdate: user.birthdate,
      age: user.age,
      url_profile: user.url_profile,
      adress: user.adress,
      roles: user.roles.map((r) => r.name),
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getAll() {
    const users = await userRepository.getAll();
    return users.map((user) => this.mapUser(user));
  }

  async getById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      throw err;
    }
    return this.mapUser(user);
  }

  async updateMe(id, payload) {
    const editable = {
      name: payload.name,
      lastName: payload.lastName,
      phoneNumber: payload.phoneNumber,
      birthdate: payload.birthdate,
      url_profile: payload.url_profile,
      adress: payload.adress,
    };

    const user = await userRepository.updateProfile(id, editable);
    if (!user) {
      const err = new Error("Usuario no encontrado");
      err.status = 404;
      throw err;
    }

    return this.mapUser(user);
  }
}

export default new UserService();