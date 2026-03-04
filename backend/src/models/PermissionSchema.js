import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, '权限代码不能为空'],
      unique: true,
      trim: true,
      index: true
    },
    name: {
      type: String,
      required: [true, '权限名称不能为空'],
      trim: true
    },
    category: {
      type: String,
      required: [true, '权限分类不能为空'],
      enum: ['system', 'user', 'agent', 'knowledge', 'other'],
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    resource: {
      type: String,
      required: [true, '资源类型不能为空']
    },
    action: {
      type: String,
      required: [true, '操作类型不能为空'],
      enum: ['view', 'create', 'edit', 'delete', 'manage', 'execute']
    },
    isSystem: {
      type: Boolean,
      default: false
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
    collection: 'permissions'
  }
);

permissionSchema.index({ category: 1, resource: 1 });
permissionSchema.index({ createdAt: -1 });

permissionSchema.virtual('id').get(function () {
  return this._id.toString();
});

permissionSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret._id;
    delete ret.__v;
    ret.id = doc._id.toString();
    return ret;
  }
});

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
