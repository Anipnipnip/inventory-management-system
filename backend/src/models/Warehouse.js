import mongoose from 'mongoose';

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Warehouse name must be at least 2 characters'],
      maxlength: [100, 'Warehouse name must be at most 100 characters'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [300, 'Location must be at most 300 characters'],
      default: '',
    },
    // The warehouse used automatically for stock in/out when the caller
    // doesn't specify one. Exactly one warehouse should have this set --
    // enforced in the service/controller layer, not the schema, since
    // Mongoose validators run per-document and can't see other documents.
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Warehouse = mongoose.model('Warehouse', warehouseSchema);

export default Warehouse;
