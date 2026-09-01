const mongoose = require('mongoose');

const maintenanceModeSchema = new mongoose.Schema(
  {
    isEnabled: {
      type: Boolean,
      default: false,
    },
    message: {
      type: String,
      default: '',
      maxlength: 500,
    },
    enabledAt: {
      type: Date,
      default: null,
    },
    enabledBy: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Get the singleton maintenance mode document (creates one if it doesn't exist).
 */
maintenanceModeSchema.statics.getStatus = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({ isEnabled: false });
  }
  return doc;
};

/**
 * Toggle maintenance mode on or off.
 * @param {boolean} isEnabled
 * @param {string} [message]
 * @param {string} [adminEmail]
 */
maintenanceModeSchema.statics.toggle = async function (isEnabled, message, adminEmail) {
  const update = {
    isEnabled,
    message: message || '',
    enabledAt: isEnabled ? new Date() : null,
    enabledBy: isEnabled ? adminEmail : null,
  };

  const doc = await this.findOneAndUpdate({}, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  });

  return doc;
};

module.exports = mongoose.model('MaintenanceMode', maintenanceModeSchema);
