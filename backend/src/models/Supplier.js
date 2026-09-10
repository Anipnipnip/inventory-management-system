import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Supplier name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Supplier name must be at least 2 characters'],
      maxlength: [100, 'Supplier name must be at most 100 characters'],
    },
    // Contact fields are optional -- businesses often record a supplier's
    // name before full contact details are available.
    contactPerson: {
      type: String,
      trim: true,
      maxlength: [100, 'Contact person must be at most 100 characters'],
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      maxlength: [300, 'Address must be at most 300 characters'],
      default: '',
    },
    // Soft-delete flag. Products (Phase 7) may reference this supplier,
    // so it's deactivated rather than removed.
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Supplier = mongoose.model('Supplier', supplierSchema);

export default Supplier;
