import mongoose from "mongoose";

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&\*@]).{8,}$/;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator(value) {
          return PASSWORD_REGEX.test(value);
        },
        message:
          "La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 dígito y 1 caracter especial (# $ % & * @).",
      },
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    birthdate: {
      type: Date,
      required: true,
    },
    url_profile: {
      type: String,
      trim: true,
      default: "",
    },
    adress: {
      type: String,
      trim: true,
      default: "",
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  },
  { timestamps: true }
);

UserSchema.virtual("age").get(function () {
  if (!this.birthdate) return null;

  const today = new Date();
  const birth = new Date(this.birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();

  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
});

UserSchema.set("toJSON", { virtuals: true });
UserSchema.set("toObject", { virtuals: true });

export default mongoose.model("User", UserSchema);