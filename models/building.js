const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaObjectId = mongoose.ObjectId;
const validation = require('../inputVerification').general;

const machineSubDocSchema = new Schema({
  name: {
    type: String,
    validate: function(v) {
      validation.verifyArg(
          v,
          'Name of machine',
          'MachineSubDocSchema',
          'string',
      );
    },
    required: true,
  },
  modelId: {
    type: SchemaObjectId,
    required: true,
  },
});

const messageJSON = {
  type: String,
  required: true,
  validate: [
    function(v) {
      if (typeof v !== 'string') return false;
      if (v.trim().length === 0) return false;
      if (v.trim().length !== v.length) return false;
      return true;
    },
    'The comment was not a string, had trailing whitespace, or was empty',
  ],
};

const timestampJSON = {
  type: Date,
  required: true,
};

const lowerCommentSchema = new Schema({
  posterId: {
    type: SchemaObjectId,
    required: true,
  },
  message: messageJSON,
});

const upperCommentSchema = new Schema({
  posterId: {
    type: SchemaObjectId,
    required: true,
  },
  message: messageJSON,
  timestamp: timestampJSON,
  replies: [lowerCommentSchema],
});

const buildingSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
        validate: (v) =>
          validation.verifyArg(v, 'name', 'Building Schema', 'string'),
      },
      location: {
        type: {
          type: String,
          required: true,
          enum: ['Point'],
          validate: (v) =>
            validation.verifyArg(
                v,
                'location\'s type',
                'Building Schema',
                'string',
            ),
        },
        coordinates: {
          type: [Number],
          required: true,
          validate: [
            function(v) {
              if (typeof v !== 'object') return false;
              if (!Array.isArray(v)) return false;
              if (v.length !== 2) return false;
              v.forEach(function(e) {
                if (typeof e !== 'number') return false;
              });
              return true;
            },
            'Coordinates must be an array of numbers',
          ],
        },
      },
      washers: {
        type: [machineSubDocSchema],
        validate: [
          function(v) {
            return Array.isArray(v);
          },
          'Washers was not an array',
        ],
      },
      driers: {
        type: [machineSubDocSchema],
        validate: [
          function(v) {
            return Array.isArray(v);
          },
          'Driers was not an array',
        ],
      },
      accessGroups: {
        type: [String],
        validate: function(v) {
          if (!Array.isArray(v)) return false;
          v.forEach((s) => {
            if (!(typeof s === 'string' && s.trim().length !== 0)) {
              return false;
            }
          });
          return true;
        },
      },
      comments: [upperCommentSchema],
    },
    {
      timestamps: true,
    },
);

const Building = mongoose.model('Buildings', buildingSchema);
module.exports = Building;
