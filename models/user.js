const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validation = require('../inputVerification');

const accessGroupSchema = {
  type: [String],
  required: false,
  validate: (v) => {
    if (typeof v !== 'object' || !Array.isArray(v)) return false;
    v.forEach((s) =>
      validation.general.verifyArg(s, 'accessGroup', 'User Schema', 'string'),
    );
  },
  default: [],
};

const userSchema = new Schema(
    {
    // "_id": "6176b2a43910c60213c68c7c",
      email: {
        type: String,
        required: true,
        validate: [
          function(e) {
            if (typeof e !== 'string') return false;
            if (
              !e.match(
                  /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
              )
            ) {
              return false;
            }
            return true;
          },
          'The email address provided was not valid',
        ],
      },
      name: {
        first: {
          type: String,
          required: true,
          validate: (v) =>
            validation.general.verifyArg(v, 'firstName', 'User Schema', 'string'),
        },
        last: {
          type: String,
          required: true,
          validate: (v) =>
            validation.general.verifyArg(v, 'lastName', 'User Schema', 'string'),
        },
      },
      password: {
        type: String,
        required: true,
        validate: (v) => {
          validation.general.verifyArg(v, 'password', 'User Schema', 'string');
          return v.match(/^\$2[ayb]\$.{56}$/); // https://stackoverflow.com/a/32190124
        },
      },
      accessGroups: accessGroupSchema,
      appliedAccessGroups: accessGroupSchema,
      privilegedAccessGroups: accessGroupSchema,
      role: {
        type: String,
        required: true,
        enum: ['student', 'ra', 'maintenance', 'admin'],
        validate: (v) =>
          validation.general.verifyArg(v, 'role', 'User Schema', 'string'),
      },
    },
    {
      timestamps: true,
    },
);

const User = mongoose.model('Users', userSchema);
module.exports = User;
