import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, '角色代码不能为空'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, '角色名称不能为空'],
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    permissions: [{
      type: String,
      ref: 'Permission'
    }],
    isSystem: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    collection: 'roles'
  }
);

roleSchema.index({ createdAt: -1 });
roleSchema.index({ isActive: 1 });

roleSchema.virtual('id').get(function () {
  return this._id.toString();
});

roleSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const Role = mongoose.model('Role', roleSchema);

export default Role;
