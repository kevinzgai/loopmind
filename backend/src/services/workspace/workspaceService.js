import Workspace from '../../models/WorkspaceSchema.js';
import crypto from 'crypto';

class WorkspaceService {
  /**
   * 创建工作空间
   */
  async createWorkspace(ownerId, data) {
    // 生成唯一 slug
    const slug = await this.generateSlug(data.name);

    const workspace = new Workspace({
      ...data,
      ownerId,
      slug,
      members: [
        {
          userId: ownerId,
          role: 'owner',
          joinedAt: new Date(),
        },
      ],
    });

    await workspace.save();
    return workspace;
  }

  /**
   * 获取用户所属的工作空间列表
   */
  async getUserWorkspaces(userId) {
    return await Workspace.find({
      $or: [{ ownerId: userId }, { 'members.userId': userId }],
      isActive: true,
    })
      .populate('ownerId', 'username email avatar')
      .sort({ createdAt: -1 });
  }

  /**
   * 获取单个工作空间
   */
  async getWorkspace(workspaceId) {
    const workspace = await Workspace.findById(workspaceId)
      .populate('ownerId', 'username email avatar')
      .populate('members.userId', 'username email avatar');

    if (!workspace) throw new Error('工作空间不存在');
    return workspace;
  }

  /**
   * 更新工作空间
   */
  async updateWorkspace(workspaceId, updates) {
    const workspace = await Workspace.findByIdAndUpdate(workspaceId, updates, { new: true });
    if (!workspace) throw new Error('工作空间不存在');
    return workspace;
  }

  /**
   * 删除工作空间
   */
  async deleteWorkspace(workspaceId) {
    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      { isActive: false },
      { new: true }
    );
    if (!workspace) throw new Error('工作空间不存在');
    return workspace;
  }

  /**
   * 邀请成员
   */
  async inviteMember(workspaceId, inviterId, targetUserId, role = 'viewer') {
    const workspace = await this.getWorkspace(workspaceId);

    // 检查成员是否已存在
    const exists = workspace.members.find(
      (m) => m.userId._id.toString() === targetUserId
    );
    if (exists) throw new Error('该用户已是工作空间成员');

    // 检查成员数量限制
    if (workspace.members.length >= workspace.settings.maxMembers) {
      throw new Error(`工作空间成员数量已达上限 (${workspace.settings.maxMembers})`);
    }

    workspace.members.push({
      userId: targetUserId,
      role,
      joinedAt: new Date(),
      invitedBy: inviterId,
    });

    await workspace.save();
    return workspace;
  }

  /**
   * 移除成员
   */
  async removeMember(workspaceId, targetUserId) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('工作空间不存在');

    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== targetUserId
    );

    await workspace.save();
    return workspace;
  }

  /**
   * 更新成员角色
   */
  async updateMemberRole(workspaceId, targetUserId, newRole) {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) throw new Error('工作空间不存在');

    const member = workspace.members.find(
      (m) => m.userId.toString() === targetUserId
    );
    if (!member) throw new Error('成员不存在');

    member.role = newRole;
    await workspace.save();
    return workspace;
  }

  /**
   * 生成邀请码
   */
  async generateInviteCode(workspaceId, expiryHours = 24) {
    const code = crypto.randomBytes(8).toString('hex').toUpperCase();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + expiryHours);

    const workspace = await Workspace.findByIdAndUpdate(
      workspaceId,
      {
        inviteCode: code,
        inviteCodeExpiry: expiry,
        inviteCodeEnabled: true,
      },
      { new: true }
    );

    return { code, expiry };
  }

  /**
   * 通过邀请码加入工作空间
   */
  async joinByInviteCode(userId, code) {
    const workspace = await Workspace.findOne({
      inviteCode: code,
      inviteCodeEnabled: true,
      inviteCodeExpiry: { $gt: new Date() },
      isActive: true,
    });

    if (!workspace) throw new Error('邀请码无效或已过期');

    // 检查是否已是成员
    const exists = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (exists) throw new Error('您已经是该工作空间的成员');

    workspace.members.push({
      userId,
      role: 'viewer',
      joinedAt: new Date(),
    });

    await workspace.save();
    return workspace;
  }

  /**
   * 检查用户权限
   */
  async checkPermission(workspaceId, userId, requiredRole = 'viewer') {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return false;

    // Owner 有所有权限
    if (workspace.ownerId.toString() === userId) return true;

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!member) return false;

    const roleHierarchy = { owner: 4, admin: 3, editor: 2, viewer: 1 };
    return (roleHierarchy[member.role] || 0) >= (roleHierarchy[requiredRole] || 0);
  }

  /**
   * 生成唯一 slug
   */
  async generateSlug(name) {
    const base = name
      .toLowerCase()
      .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);

    let slug = base;
    let counter = 1;

    while (await Workspace.findOne({ slug })) {
      slug = `${base}-${counter++}`;
    }

    return slug;
  }
}

export default new WorkspaceService();
